
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
                   

                    echo "Old application containers removed."
                '''
            }
        }
// ===========================================================
// 4. Check Tools
// ===========================================================

        stage('Check Tools') {
            steps {
                sh '''
                    set -e

                    export PATH="/usr/sbin:/snap/bin:$PATH"

                    echo "===== Docker Version ====="
                    docker --version

                    echo "===== Helm Version ====="
                    helm version

                    echo "===== Kubernetes Nodes ====="
                    kubectl get nodes

                    echo "===== Helm Chart ====="
                    test -f ./shopsphere/Chart.yaml
                '''
            }
        }
stage('Check Tools') {
            steps {
                sh '''
                    set -e

                    export PATH="/usr/sbin:/snap/bin:$PATH"

                    echo "===== Docker Version ====="
                    docker --version

                    echo "===== Helm Version ====="
                    helm version

                    echo "===== Kubernetes Nodes ====="
                    kubectl get nodes

                    echo "===== Helm Chart ====="
                    test -f ./shopsphere/Chart.yaml
                '''
            }
        }
        // ==========================================
        // 5. Backend image Build
        // ==========================================

        stage('Backend Image Build') {
            steps {
                sh '''
                    set -e 
                    echo "===== Building Backend Image ====="

                    docker build \
                        -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                        ./backend
                        
                        '''
            }
     }


 // ==========================================
// 6. Frontend image Build
// ==========================================
             
              stage('Backend Image Build') {
            steps {
                sh '''
                    set -e 

                    echo "===== Building Frontend Image ====="

                    docker build \
                        -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                        ./frontend
                '''
            }
        }


        // ==========================================
        // 7. Docker Hub Login - ONE TIME  ,set -e= agar koi command fail ho jaaye, toh script ko stop kar do.
        // ==========================================

        stage('Docker Hub Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKER_CREDENTIALS_ID}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
 
                        set -e  

                        echo "$DOCKER_PASSWORD" |
                          docker login \
                            --username "$DOCKER_USER" \
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

                  set -e 

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

                  set -e

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
// 10. Deploy with Helm
// ==========================================



        stage('Deploy with Helm') {
            steps {
                sh '''
                    set -e

                    export PATH="/usr/sbin:/snap/bin:$PATH"
                    export KUBECONFIG=/var/lib/jenkins/.kube/config

                    echo "===== Deploying ShopSphere with Helm ====="

                    helm upgrade --install ${HELM_RELEASE} ${HELM_CHART} \
                      --namespace ${K8S_NAMESPACE} \
                      --set backend.image.repository=${DOCKERHUB_USER}/${BACKEND_IMAGE} \
                      --set backend.image.tag=${IMAGE_TAG} \
                      --set frontend.image.repository=${DOCKERHUB_USER}/${FRONTEND_IMAGE} \
                      --set frontend.image.tag=${IMAGE_TAG}

                    echo "===== Waiting for Backend Rollout ====="

                    kubectl rollout status deployment/backend \
                      -n ${K8S_NAMESPACE} \
                      --timeout=180s

                    echo "===== Waiting for Frontend Rollout ====="

                    kubectl rollout status deployment/frontend \
                      -n ${K8S_NAMESPACE} \
                      --timeout=180s
                '''
            }
        }




        // ==========================================
        // 8. Pull Images from Docker Hub
        // ==========================================

        //stage('Pull Images') {
          //  steps {
          //      sh '''
            //        echo "===== Pulling Backend Image ====="

                //    docker pull \
                    //    ${DOCKERHUB_USER}/${BACKEND_IMAGE}:${IMAGE_TAG}

                   // echo "===== Pulling Frontend Image ====="

                 //   docker pull \
                //        ${DOCKERHUB_USER}/${FRONTEND_IMAGE}:${IMAGE_TAG}
                //'''
            //}
       // }



        // ==========================================
        // 11. Verify Deployment
        // ==========================================



// stage('Verify Deployment') {
       //     steps {
        //        sh '''
          //          set -e

          //          export PATH="/usr/sbin:/snap/bin:$PATH"
                    export KUBECONFIG=/var/lib/jenkins/.kube/config

          //          echo "===== Kubernetes Pods ====="

             //       kubectl get pods -n ${K8S_NAMESPACE}

             //       echo "===== Kubernetes Services ====="

             //       kubectl get services -n ${K8S_NAMESPACE}

              //      echo "===== Helm Release Status ====="

              //      helm status ${HELM_RELEASE} -n ${K8S_NAMESPACE}

             //       echo "===== Deployment Verification Complete ====="
             //   '''
           // }
      //  }
    //}
        // ==========================================
        //  9. Deploy MYSQL
        // ==========================================
// stage('Deploy MySQL') {
// steps {
//   sh '''
//       echo "===== Checking Existing MySQL ====="

//            if docker ps --filter "name=^shopsphere-mysql$" \
//               --filter "status=running" \
//                --format '{{.Names}}' | grep -qx "shopsphere-mysql"; then
//                echo "Existing MySQL is running. Keeping it."
//            else
//              echo "ERROR: MySQL is not running. Deployment stopped."
//               exit 1
//           fi
//        '''
//   }
// }
        // ==========================================
        // 9. Deploy Backend
        // ==========================================

      //  stage('Deploy Backend') {
      //      steps {
      //          sh '''
        //            echo "===== Starting Backend Container ====="

         //           docker run -d \
             //           --name ${BACKEND_CONTAINER} \
           //             --network ${DOCKER_NETWORK} \
               //         -e DB_URL="jdbc:mysql://shopsphere-mysql:3306/shopsphere" \
               //         -e DB_USERNAME="shopsphere_app" \
                  //      -e DB_PASSWORD="ShopSphereApp@2026" \
                 //       -p 8081:8081 \
                 //       ${DOCKERHUB_USER}/${BACKEND_IMAGE}:${IMAGE_TAG}
                //'''
           // }
       // }




        // ==========================================
        // 10. Deploy Frontend
        // ==========================================

        //stage('Deploy Frontend') {
          //  steps {
          //      sh '''
              //      echo "===== Starting Frontend Container ====="

               //     docker run -d \
                  //      --name ${FRONTEND_CONTAINER} \
                  //      --network ${DOCKER_NETWORK} \
                   //     -p 3000:3000 \
                  //       ${DOCKERHUB_USER}/${FRONTEND_IMAGE}:${IMAGE_TAG}
                //'''
           // }
    //   }

     //  or 

     //  stage('Deploy Frontend Container') {
//  steps {
//  sh '''
// set -e

// ```
   //      CONTAINER_NAME="shopsphere-frontend"
     //    HOST_PORT="3001"
     //    CONTAINER_PORT="3000"

      //   # Remove only our previous container, if it exists
       //  if docker container inspect "$CONTAINER_NAME" >/dev/null 2>&1; then
            docker rm -f "$CONTAINER_NAME"
       //  fi

       //  # Start the new container
       //  docker run -d \
          //   --name "$CONTAINER_NAME" \
          //   --restart unless-stopped \
          //   -p "${HOST_PORT}:${CONTAINER_PORT}" \
          //   anitaraut/shopsphere-frontend:v1

        // echo "Frontend deployed on host port ${HOST_PORT}"
    // '''
// }


// }



        // ==========================================
        // 11. Verify Deployment
        // ==========================================

      //   stage('Verify') {
            // steps {
              //   sh '''
                  //   echo "===== Docker Images ====="

                   //  docker images | grep shopsphere || true


                 //    echo "===== Running Containers ====="

                  //   docker ps


                  //   echo "===== Backend API Test  ====="

                 //    sleep 30

                  //   curl -f http://localhost:8081/health
               //  '''
           //  }
        // }
   //  }


    // ==========================================
    // Post Actions
    // ==========================================

     post {
        always {
            sh '''
                docker logout || true
            '''
        }

        success {
            echo 'ShopSphere CI/CD pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed. Check the failed stage and its Console Output.'
        }
    }


// Or

  //  post {

    //    always {
    //        sh 'docker logout || true'
     //   }

     //   success {
      //     echo ''' 
            //    ==========================================
          //      ShopSphere CI/CD Pipeline SUCCESS
        //        ========================================== '''
       // }

        // failure {
         //   echo '''
           //    ============================================
           //   shopsphere CI/CD Pipeline failed. 
              //Check the failed stage and logs.
             // =============================================
             // '''
        //}
   // }
 //}