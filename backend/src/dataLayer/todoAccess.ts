import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';
import { S3 } from 'aws-sdk';

const XAWS = AWSXRay.captureAWS(AWS);
const { TODOS_TABLE, TODOS_BUCKET, SIGNED_URL_EXPIRATION } = process.env;
const signedUrlExpiration = Number(SIGNED_URL_EXPIRATION);

const createDynamoDbClient = () => {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance');
    return new (XAWS.DynamoDB as any).DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
      convertEmptyValues: true,
    });
  }
  return new (XAWS.DynamoDB as any).DocumentClient({ convertEmptyValues: true });
};

const createS3Client = () => {
  const s3 = new XAWS.S3({
    signatureVersion: 'v4',
  });
  return s3;
};

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDbClient(),
    private readonly s3: S3 = createS3Client(),
  ) {}

  async createItem(dto: TodoItem): Promise<TodoItem> {
    const item = await this.docClient
      .put({
        TableName: TODOS_TABLE,
        Item: dto,
      })
      .promise();
    return dto;
  }

  async updateItem(userId: string, todoId: string, dto: TodoUpdate): Promise<TodoItem> {
    const item = await this.docClient
      .update({
        TableName: TODOS_TABLE,
        Key: {
          userId,
          todoId,
        },
        UpdateExpression: `SET
          #name = :name,
          dueDate = :dueDate,
          done = :done
        `,
        ExpressionAttributeValues: {
          ':name': dto.name,
          ':dueDate': dto.dueDate,
          ':done': dto.done,
        },
        ExpressionAttributeNames: {
          '#name': 'name',
        },
        ReturnValues: 'ALL_NEW',
      })
      .promise();
    return <TodoItem>(item as unknown);
  }

  async getById(userId: string, todoId: string): Promise<TodoItem> {
    const item = await this.docClient
      .get({
        TableName: TODOS_TABLE,
        Key: {
          userId,
          todoId,
        },
      })
      .promise();
    return <TodoItem>item.Item;
  }

  async deleteItem(userId: string, todoId: string): Promise<void> {
    await this.docClient
      .delete({
        TableName: TODOS_TABLE,
        Key: {
          userId,
          todoId,
        },
      })
      .promise();
  }

  async deleteFile(userId: string, todoId: string): Promise<void> {
    await this.s3
      .deleteObject({
        Bucket: TODOS_BUCKET,
        Key: `${userId}_${todoId}`,
      })
      .promise();
  }

  async getItems(userId: string): Promise<TodoItem[]> {
    const payload = await this.docClient
      .query({
        TableName: TODOS_TABLE,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })
      .promise();
    return <TodoItem[]>payload.Items;
  }

  async updateAttachmentUrl(userId: string, todoId: string): Promise<void> {
    const key = `${userId}_${todoId}`;
    await this.docClient
      .update({
        TableName: TODOS_TABLE,
        Key: {
          userId,
          todoId,
        },
        UpdateExpression: `SET attachmentUrl = :attachmentUrl`,
        ExpressionAttributeValues: {
          ':attachmentUrl': `https://${TODOS_BUCKET}.s3.amazonaws.com/${key}`,
        },
        ReturnValues: 'NONE',
      })
      .promise();
  }

  generatePresignedUrl(userId: string, todoId: string): string {
    const key = `${userId}_${todoId}`;
    return this.s3.getSignedUrl('putObject', {
      Bucket: TODOS_BUCKET,
      Key: key,
      Expires: signedUrlExpiration,
    });
  }
}
