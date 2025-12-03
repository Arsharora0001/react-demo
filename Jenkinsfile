pipeline {
    agent any

    environment {
        AWS_REGION      = 'ap-south-1'
        AWS_ACCOUNT_ID  = '316770681739'
        ECR_REPO        = 'react-eks-demo'
        IMAGE_TAG       = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Arsharora0001/react-demo.git'
            }
        }

        stage('Install & Build React') {
            steps {
                sh '''
                cd frontend
                npm install
                npm run build
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonarqube') {
                    sh '''
                    sonar-scanner
                    '''
                }
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    env.IMAGE = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}"

                    sh """
                    aws ecr get-login-password --region ${AWS_REGION} | \
                      docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

                    docker build -t ${IMAGE} frontend/
                    """
                }
            }
        }

        stage('Trivy Scan') {
            steps {
                sh """
                trivy image --exit-code 1 --severity HIGH,CRITICAL ${IMAGE}
                """
            }
        }

        stage('Push to ECR') {
            steps {
                sh """
                docker push ${IMAGE}
                """
            }
        }

        stage('Update K8s Manifest (local workspace)') {
            steps {
                script {
                    sh """
                    sed -i 's|image: .*react-eks-demo.*|image: ${IMAGE}|g' k8s/prod/deployment.yaml
                    """
                }
            }
        }

        // OPTIONAL: If you want Jenkins to push manifest change back to Git
        // stage('Commit & Push Manifest') {
        //     steps {
        //         withCredentials([usernamePassword(credentialsId: 'github-creds', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
        //             sh '''
        //             git config user.email "ci@example.com"
        //             git config user.name "Jenkins CI"
        //             git add k8s/prod/deployment.yaml
        //             git commit -m "Update image to ${IMAGE}"
        //             git push https://$USER:$PASS@github.com/your-user/react-eks-demo.git HEAD:main
        //             '''
        //         }
        //     }
        // }
    }
}

