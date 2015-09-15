REPORTER = dot

test:
	@NODE_ENV=test istanbul cover --handle-sigint ./node_modules/.bin/_mocha -- \
		--reporter $(REPORTER) \

test-w:
	@NODE_ENV=test istanbul cover ./node_modules/.bin/_mocha -- \
		--reporter $(REPORTER) \
		--growl \
		--watch

docs:
	@NODE_ENV=test groc	

.PHONY: test test-w