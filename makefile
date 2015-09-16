REPORTER = dot

test:
	@NODE_ENV=test heroku local:run istanbul cover --handle-sigint ./node_modules/.bin/_mocha -- \

test-w:
	@NODE_ENV=test heroku local:run istanbul cover ./node_modules/.bin/_mocha -- \
		--growl \
		--watch

docs:
	@NODE_ENV=test groc	

.PHONY: test test-w