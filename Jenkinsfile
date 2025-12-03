pipeline {
    agent any

    environment {
        AWS_REGION     = "ap-south-1"
        AWS_ACCOUNT_ID = "316770681739"          // <- tumhara Owner ID
        ECR_REPO       = "react-demo"           // <- ECR repo ka naam

        IMAGE_TAG = "latest"
        ECR_URI   = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"
    }

    options {
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                echo "📥 Checking out source code from Git..."
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    echo "🔎 Running SonarQube analysis..."
                    try {
                        withSonarQubeEnv('sonar') {
                            sh """
                              sonar-scanner \
                                -Dsonar.projectKey=react-demo \
                                -Dsonar.projectName=react-demo \
                                -Dsonar.sources=frontend
                            """
                        }
                    } catch (err) {
                        echo "⚠️ SonarQube analysis failed, but continuing pipeline: ${err}"
                    }
                }
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    echo "🐳 Building Docker image via Dockerfile in frontend..."
                    sh """
                      docker build -t ${ECR_URI}:${IMAGE_TAG} frontend
                    """
                }
            }
        }

        stage('Trivy Scan') {
            steps {
                script {
                    echo "🛡 Scanning image with Trivy..."
                    sh "docker pull aquasec/trivy:latest || true"

                    sh """
                      docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy:latest image \
                        --severity HIGH,CRITICAL \
                        --exit-code 0 \
                        ${ECR_URI}:${IMAGE_TAG}
                    """
                }
            }
        }

        stage('Push to ECR') {
            steps {
                script {
                    echo "🔐 Logging in to ECR & pushing image..."
                    sh """
                      aws ecr get-login-password --region ${AWS_REGION} | \
                        docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

                      docker push ${ECR_URI}:${IMAGE_TAG}
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline SUCCESS – image pushed to ECR. Deploy ArgoCD karega k8s manifests se."
        }
        failure {
            echo "❌ Pipeline FAILED – console output dekh ke stage fix karo."
        }
    }
}
