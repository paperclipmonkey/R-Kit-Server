REPORTER = dot

test:
	@NODE_ENV=test istanbul cover ./node_modules/.bin/_mocha -- \
		--reporter $(REPORTER) \

test-w:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--growl \
		--watch
		
.PHONY: test test-w