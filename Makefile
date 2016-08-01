build:
	docker build -t quay.io/cloudytimemachine/frontend .

minikube:
	@minikube version
	@minikube status
	@minikube start
	@echo 'Copy/Paste the following command into your shell:'
	@echo 'eval $$(minikube docker-env) && export DOCKER_API_VERSION=1.23'
	@export DOCKER_API_VERSION=1.23

minikube-context:
	@kubectl config use-context minikube

minikube-create: minikube-context build
	kubectl create -f kube/frontend.service.yml
	kubectl create -f kube/frontend.deployment.yml

minikube-delete: minikube-context
	kubectl delete -f kube/frontend.service.yml
	kubectl delete -f kube/frontend.deployment.yml

minikube-apply: minikube-context
	kubectl apply -f kube/frontend.deployment.yml
	kubectl delete pod -l app=frontend

minikube-update: build minikube-apply
