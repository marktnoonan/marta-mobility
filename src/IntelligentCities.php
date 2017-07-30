<?php
require_once './Model/Delay.php';
require_once './Model/Asset.php';

$client_token = "";
$debug = false;

class IntelligentCities {
    /** Constants **/
    const eventURL = "https://ic-event-service.run.aws-usw02-pr.ice.predix.io/v2";
    const metadata_url = "https://ic-metadata-service.run.aws-usw02-pr.ice.predix.io/v2/metadata";
    const env_zone_id = "SDSIM-IE-ENVIRONMENTAL";
    const username = "hackathon";
    const password = "@hackathon"; // TODO: Move the username and password to a safer place.
    const debug = false;

    /*
     *  MAIN function that given a latitude and a longitude returns an estimated delay in minutes on the time of arrival
     *  given its nearby nodes environmental and traffic information.
     */
    public static function determineETADelay($latitude, $longitude) {
        $time = 1500328704000; // On a real environment we would use time() * 1000
        IntelligentCities::fetchNearbyAssetsData($latitude, $longitude, $time);
        //TODO: feed the retrieved information from the nearby nodes to the decision tree which will determine the estimated delay

        $ETAModifier = Delay::LARGE; // TODO: Replace mock response with the decision tree classification result
        return $ETAModifier;
    }

    /*
     * MAIN function that given a latitude and a longitude returns an Asset array which contains the environmental,
     * traffic and awareness information available on each node
     */
    public static function gatherReportData($latitude, $longitude){

    }

    /** Function that renews the access token using the given username and password credentials for the nodes **/
    private static function refreshToken() {
        $UAAURL= "https://890407d7-e617-4d70-985f-01792d693387.predix-uaa.run.aws-usw02-pr.ice.predix.io";
        $auth_uri = "/oauth/token?grant_type=client_credentials";
        $response = IntelligentCities::CallAPI("POST", $UAAURL.$auth_uri, false, false);
        $GLOBALS['client_token'] = json_decode($response);
        if($GLOBALS['debug']) {
            print $GLOBALS['client_token']->{'access_token'} != "" . "\n";
        }
    }

    /** Function that given the unique id of an asset, retrieves and returns the current registered temperature
     * fetchNodeTemperature("ENV-ATL-0009-1", 1500328704000);
     **/
    private static function fetchNodeTemperature($asset_uid, $measurement_time) {
        IntelligentCities::validateToken();

        // Time unit is in seconds, used base 6 on the delta to match time units ex: 1*60^1 = 60s, 1*60^2 = 3600s = 1h...
        $delta = 1000 * pow(60, 1); // timestamp is in milliseconds
        $event_type = "TEMPERATURE";
        $start_time =   $measurement_time - $delta;
        $end_time =     $measurement_time;

        print "Retrieving " . $asset_uid . " environmental data...\n";
        $response = IntelligentCities::CallAPI("GET", IntelligentCities::eventURL
            . "/assets/" . $asset_uid
            . "/events?eventType=". $event_type
            . "&startTime=" . $start_time . "&endTime=" . $end_time
        );
        if($GLOBALS['debug']) {
            var_dump($response);
        }
        return $response;
    }

    /**
     * Function that given a latitude and longitude retrieves and returns an array with the nearby nodes containing temperature and traffic data
     * fetchNearbyNodesData(33.754226,-84.396138);
     **/
    private static function fetchNearbyAssetsData($xCenter, $yCenter, $measurementTime){

        // Get the nearby nodes to the given coordinates
        $nearbyAssetsResponse = IntelligentCities::fetchNearbyAssets($xCenter, $yCenter);
        $nearbyAssetsAssociativeArray = json_decode($nearbyAssetsResponse, true);
        $assetArray = Asset::parseNodes($nearbyAssetsAssociativeArray);

        // Retrieve additional node data
        foreach ($assetArray as $asset) {

            $assetEnvironmentalResponse = IntelligentCities::fetchNodeTemperature($asset->assetUid, $measurementTime);
            $assetEnvironmentalData = json_decode($assetEnvironmentalResponse, true);
            Asset::parseNodeEnvironmentalData($asset, $assetEnvironmentalData);
        }
        var_dump($assetArray);
        return $assetArray;
    }

    /**
     * Function that given a latitude and longitude retrieves and returns an array with the nearby nodes
     * fetchNearbyNodes(33.754226,-84.396138);
     **/
    private static function fetchNearbyAssets($xcenter, $ycenter){
        IntelligentCities::validateToken();
        $km_radious = 1 * 0.01; // GPS resolution second decimal place worth up to 1.1km

        // Generate a bounding box given specific GPS coordinates
        $bbox_x1 = $xcenter - $km_radious;
        $bbox_y1 = $ycenter - $km_radious;
        $bbox_x2 = $xcenter + $km_radious;
        $bbox_y2 = $ycenter + $km_radious;
        $page = 0;
        $size = 10;

        if($GLOBALS['debug']) {
            print "Bounding box is: " . $bbox_x1 . ", " .$bbox_y1 . " : " . $bbox_x2 . ", " . $bbox_y2 . "\n";
        }
        $asset_type = "ENV_SENSOR";
        $event_type = "TEMPERATURE";
        $request_uri = "/assets/search?";

        if($GLOBALS['debug']) {
            print "Retrieving " . $xcenter . ", " . $ycenter . " nearby nodes...\n";
        }

        $response = IntelligentCities::CallAPI("GET", IntelligentCities::metadata_url
            . $request_uri
            . "bbox=" . $bbox_x1 . ":" . $bbox_y1 . "," . $bbox_x2 . ":" . $bbox_y2
            . "&page=" . $page
            . "&size=" . $size
            . "&q=assetType:" . $asset_type
            . "&eventType=". $event_type
        );
        if($GLOBALS['debug']) {
            var_dump($response);
        }

        // Parse the node response
        return $response;
    }

    /** Function that checks whether the token is valid or expired and returns a boolean with true if the token is still valid **/
    private static function validateToken(){
        // TODO: Verify the token is still valid before refreshing it and handle exceptions as invalid credentials
        IntelligentCities::refreshToken();
    }

    /**
     * Function that calls a web service given a HTTP method, an url, data and a boolean indicating with false if its a token renew type of call
     * or true if the the token is valid and data is being retrieved from the service
     *
     * Data: array("param" => "value") ==> index.php?param=value
     * Method: POST, PUT, GET
     **/
    private static function CallAPI($method, $url, $data = false, $authenticated = true)
    {
        $curl = curl_init();
        print $url . "\n";
        switch ($method)
        {
            case "POST":
                curl_setopt($curl, CURLOPT_POST, 1);

                if ($data)
                    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
                break;
            case "PUT":
                curl_setopt($curl, CURLOPT_PUT, 1);
                break;
            default:
                if ($data)
                    $url = sprintf("%s?%s", $url, http_build_query($data));
        }

        // Authentication:
        if($authenticated){
            $headers = [
                "Authorization:Bearer ".$GLOBALS["client_token"]->{'access_token'},
                "Predix-Zone-id:". IntelligentCities::env_zone_id
            ];
            curl_setopt($curl, CURLOPT_HTTPHEADER,$headers);
        } else {
            curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
            curl_setopt($curl, CURLOPT_USERPWD, IntelligentCities::username.":".IntelligentCities::password);
        }

        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

        $result = curl_exec($curl);

        curl_close($curl);

        return $result;
    }
}