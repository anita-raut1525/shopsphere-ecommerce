
pipeline {

    agent any

    environment {

        // ==========================================
        // Docker Configuration
        // ==========================================

        DOCKERHUB_USER = 'anitaraut'

        IMAGE_TAG = "v${BUILD_NUMBER}"

        BACKEND_IMAGE = 'shopsphere-backend'
        FRONTEND_IMAGE = 'shopsphere-frontend'

        MYSQL_CONTAINER = 'shopsphere-mysql'
        BACKEND_CONTAINER = 'shopsphere-backend'
        FRONTEND_CONTAINER = 'shopsphere-frontend'

        DOCKER_NETWORK = 'shopsphere-network'


        // ==========================================
        // Jenkins Credentials
        // ==========================================
        
        DOCKER_CREDENTIALS_ID = 'DockerHub-Cred'
    }


    stages {

        // ==========================================
        // 1. Checkout
        // ==========================================

        stage('Checkout') {
            steps {
               git branch: 'main',
                    url: 'https://github.com/anita-raut1525/shopsphere-ecommerce.git'
            }
        }


        // ==========================================
        // 2. Prepare Docker Network
        // ==========================================

        stage('Prepare Docker Network') {
            steps {
                sh '''
                    echo "===== Checking Docker Network ====="

                    docker network inspect ${DOCKER_NETWORK} >/dev/null 2>&1 || \
                    docker network create ${DOCKER_NETWORK}

                    echo "Docker network is ready."
                '''
            }
        }


        // ==========================================
        // 3. Clean Old Application Containers
        // ==========================================

        stage('Clean Old Deployment') {
            steps {
                sh '''
                    echo "===== Removing Old Application Containers ====="

                    docker rm -f ${BACKEND_CONTAINER} 2>/dev/null || true
                    docker rm -f ${FRONTEND_CONTAINER} 2>/dev/null || true
                    docker rm -f ${MYSQL_CONTAINER} 2>/dev/null || true

                    echo "Old application containers removed."
                '''
            }
        }


        // ==========================================
        // 4. Docker Build
        // ==========================================

        stage('Docker Build') {
            steps {
                sh '''
                    echo "===== Building Backend Image ====="

                    docker build \
                        -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                        ./backend


                    echo "===== Building Frontend Image ====="

                    docker build \
                        -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                        ./frontend
                '''
            }
        }


        // ==========================================
        // 5. Docker Hub Login - ONE TIME
        // ==========================================

        stage('Docker Hub Login') {
            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKER_CREDENTIALS_ID}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {

                    sh '''
                        echo "===== Docker Hub Login ====="

                        echo "$DOCKER_PASS" | docker login \
                            -u "$DOCKER_USER" \
                            --password-stdin
                    '''
                }
            }
        }


        // ==========================================
        // 6. Tag Images
        // ==========================================

        stage('Tag Images') {
            steps {
                sh '''
                    echo "===== Tagging Backend Image ====="

                    docker tag \
                        ${BACKEND_IMAGE}:${IMAGE_TAG} \
                        ${DOCKERHUB_USER}/${BACKEND_IMAGE}:${IMAGE_TAG}


                    echo "===== Tagging Frontend Image ====="

                    docker tag \
                        ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                        ${DOCKERHUB_USER}/${FRONTEND_IMAGE}:${IMAGE_TAG}
                '''
            }
        }


        // ==========================================
        // 7. Push Images to Docker Hub
        // ==========================================

        stage('Push Images to Docker Hub') {
            steps {
                sh '''
                    echo "===== Pushing Backend Image ====="

                    docker push \
                        ${DOCKERHUB_USER}/${BACKEND_IMAGE}:${IMAGE_TAG}


                    echo "===== Pushing Frontend Image ====="

                    docker push \
                        ${DOCKERHUB_USER}/${FRONTEND_IMAGE}:${IMAGE_TAG}
                '''
            }
        }


        // ==========================================
        // 8. Pull Images from Docker Hub
        // ==========================================

        stage('Pull Images') {
            steps {
                sh '''
                    echo "===== Pulling Backend Image ====="

                    docker pull \
                        ${DOCKERHUB_USER}/${BACKEND_IMAGE}:${IMAGE_TAG}


                    echo "===== Pulling Frontend Image ====="

                    docker pull \
                        ${DOCKERHUB_USER}/${FRONTEND_IMAGE}:${IMAGE_TAG}
                '''
            }
        }


        // ==========================================
        //  9. Deploy MYSQL
        // ==========================================
stage('Deploy MySQL') {
    steps {
        sh '''
            echo "===== Starting MySQL Container ====="

            docker rm -f shopsphere-mysql 2>/dev/null || true

            docker run -d \
                --name shopsphere-mysql \
                --network ${DOCKER_NETWORK} \
                -e MYSQL_ROOT_PASSWORD=root \
                -e MYSQL_DATABASE=shopsphere \
                -e MYSQL_USER=shopsphere_app \
                -e MYSQL_PASSWORD='ShopSphereApp@2026' \
                mysql:8.0

            echo "Waiting for MySQL..."

            sleep 20

            docker ps --filter "name=shopsphere-mysql"
        '''
    }
}
        // ==========================================
        // 9. Deploy Backend
        // ==========================================

        stage('Deploy Backend') {
            steps {
                sh '''
                    echo "===== Starting Backend Container ====="

                    docker run -d \
                        --name ${BACKEND_CONTAINER} \
                        --network ${DOCKER_NETWORK} \
                        -e DB_URL="jdbc:mysql://shopsphere-mysql:3306/shopsphere" \
                        -e DB_USERNAME="shopsphere_app" \
                        -e DB_PASSWORD="ShopSphereApp@2026" \
                        -p 8081:8081 \
                        ${DOCKERHUB_USER}/${BACKEND_IMAGE}:${IMAGE_TAG}
                '''
            }
        }


        // ==========================================
        // 10. Deploy Frontend
        // ==========================================

        stage('Deploy Frontend') {
            steps {
                sh '''
                    echo "===== Starting Frontend Container ====="

                    docker run -d \
                        --name ${FRONTEND_CONTAINER} \
                        --network ${DOCKER_NETWORK} \
                        -p 3000:3000 \
                        ${DOCKERHUB_USER}/${FRONTEND_IMAGE}:${IMAGE_TAG}
                '''
            }
        }


        // ==========================================
        // 11. Verify Deployment
        // ==========================================

        stage('Verify') {
            steps {
                sh '''
                    echo "===== Docker Images ====="

                    docker images | grep shopsphere || true


                    echo "===== Running Containers ====="

                    docker ps


                    echo "===== Backend API Test  ====="

                    sleep 30

                    curl -f http://localhost:8081/health
                '''
            }
        }
    }


    // ==========================================
    // Post Actions
    // ==========================================

    post {

        always {
            sh 'docker logout || true'
        }

        success {
           echo ''' 
                ==========================================
                ShopSphere CI/CD Pipeline SUCCESS
                ========================================== '''
        }

        failure {
            echo '''
               ============================================
              shopsphere CI/CD Pipeline failed. 
              Check the failed stage and logs.
              =============================================
              '''
        }
    }
}