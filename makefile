imageName=screendash
imageTag=latest
dockerRegistry=hub.docker.com
cache=

.PHONY: clean dist build run

help: ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

guard-%:
	@ if [ "${${*}}" = "" ]; then \
		echo "Parameter required $*"; \
		exit 1; \
		fi

clean:
	@rm -rf ./target

build: # runs the server and client
	@yarn start

docker-image:
	@docker build . -t $(dockerRegistry)$(imageName):$(imageTag) $(cache)

tag-and-push: ## Tags and pushes docker image to artifactory
	@docker push $(dockerRegistry)$(imageName):$(imageTag)

tag-and-push-latest:
	@docker push $(dockerRegistry)$(imageName):$(imageTag)
	@docker tag $(dockerRegistry)$(imageName):$(imageTag) $(dockerRegistry)$(imageName):latest
	@docker push $(dockerRegistry)$(imageName):latest

run:
	@docker-compose up $(cache)

stop:
	@docker-compose down
