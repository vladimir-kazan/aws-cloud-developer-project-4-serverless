.PHONY: clean
clean:
	rm -rf client/node_modules
	rm -rf backend/node_modules

.PHONY: install
install:
	npm install --prefix client -d
	npm install --prefix backend -d

.PHONE: dev
dev:
	npm start --prefix client start
