pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'dev',
                    credentialsId: 'github-creds',
                    url: 'https://github.com/MaKids-Academy/front-end-web-app.git'
            }
        }

        stage('Build Docker image') {
            steps {
                sh 'docker build -t fatihmedamine/frontend-app:latest .'
            }
        }

        stage('Push Docker image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh 'docker push fatihmedamine/frontend-app:latest'
                }
            }
        }
    }
}
