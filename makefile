REPORTER = dot

test:
	@NODE_ENV=test istanbul cover --handle-sigint ./node_modules/.bin/_mocha -- \

test-l:
	@NODE_ENV=test heroku local:run istanbul cover ./node_modules/.bin/_mocha -- \
		--growl \
		--watch

docs:
	@NODE_ENV=test groc	

standard:
	@NODE_ENV=test standard -F	

.PHONY: test test-w