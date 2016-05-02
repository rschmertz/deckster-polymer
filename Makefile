# Deprecated
all: build

build: env

POLYMER = public/bower_components/polymer

env: ${POLYMER}

${POLYMER}:
	bower install polymer
