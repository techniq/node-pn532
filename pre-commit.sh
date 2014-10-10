#!/bin/bash
# See: http://rifatnabi.com/post/gulp-jshint-and-git-hooks

if git diff --cached --name-only | grep '.js$' >/dev/null 2>&1
then
  ./node_modules/.bin/gulp build && git add dist/
fi

exit $?
