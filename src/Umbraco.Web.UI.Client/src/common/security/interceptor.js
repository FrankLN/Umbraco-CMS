angular.module('umbraco.security.interceptor', ['umbraco.security.retryQueue'])

// This http interceptor listens for authentication failures
.factory('securityInterceptor', ['$injector', 'securityRetryQueue', 'notificationsService', function ($injector, queue, notifications) {
    return function (promise) {
        // Intercept failed requests
        return promise.then(null, function (originalResponse) {
            
            //A 401 means that the user is not logged in
            if (originalResponse.status === 401) {

                // The request bounced because it was not authorized - add a new request to the retry queue
                promise = queue.pushRetryFn('unauthorized-server', function retryRequest() {
                    // We must use $injector to get the $http service to prevent circular dependency
                    return $injector.get('$http')(originalResponse.config);
                });
            }
            else if (originalResponse.status === 403) {
                //if the status was a 403 it means the user didn't have permission to do what the request was trying to do.
                //How do we deal with this now, need to tell the user somehow that they don't have permission to do the thing that was 
                //requested. We can either deal with this globally here, or we can deal with it globally for individual requests on the umbRequestHelper,
                // or completely custom for services calling resources.
                
                //http://issues.umbraco.org/issue/U4-2749
                
                //It was decided to just put these messages into the normal status messages. 

                var msg = "Unauthorized access to URL: <br/><i>" + originalResponse.config.url.split('?')[0] + "</i>";
                if (originalResponse.config.data) {
                    msg += "<br/> with data: <br/><i>" + angular.toJson(originalResponse.config.data) + "</i><br/>Contact your administrator for information.";
                }

                notifications.error(
                    "Authorization error", 
                    msg);
            }
            return promise;
        });
    };
}])

// We have to add the interceptor to the queue as a string because the interceptor depends upon service instances that are not available in the config block.
.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.responseInterceptors.push('securityInterceptor');
}]);