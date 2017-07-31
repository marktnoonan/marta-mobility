<?php
require_once './Model/DebugVerbosity.php';
require_once './IA/DecisionTree.php';
require_once './Model/Delay.php';
require_once './Model/Asset.php';

$client_token = null;
$debug = DebugVerbosity::PRODUCTION;

if (isset($_POST['myLat']) && isset($_POST['myLong']) && isset($_POST['resource'])){
  $postedLat = $_POST['myLat'];
  $postedLong = $_POST['myLong'];
  $resource = $_POST['resource'];
  if($resource === "eta"){
        $myDelay = IntelligentCities::determineETADelay($postedLat, $postedLong);
        echo $myDelay;
  }else{
      $myNodeData = IntelligentCities::gatherReportData($postedLat, $postedLong);
      echo json_encode($myNodeData);
  }
}


class IntelligentCities {
    /** Constants **/
    const eventURL = "https://ic-event-service.run.aws-usw02-pr.ice.predix.io/v2";
    const metadata_url = "https://ic-metadata-service.run.aws-usw02-pr.ice.predix.io/v2/metadata";
    const media_url = 'https://ic-media-service.run.aws-usw02-pr.ice.predix.io/v2/mediastore';
    const env_zone_id = "SDSIM-IE-ENVIRONMENTAL";
    const traffic_zone_id= 'SDSIM-IE-TRAFFIC';
    const ps_zone_id = 'SDSIM-IE-PUBLIC-SAFETY';
    const username = "hackathon";
    const password = "@hackathon"; // TODO: Move the username and password to a safer place.

    /*
     *  MAIN function that given a latitude and a longitude returns an estimated delay in minutes on the time of arrival
     *  given its nearby nodes environmental and traffic information.
     */
    public static function determineETADelay($latitude, $longitude) {
        $time = 1500118662204; // On a real environment we would use time() * 1000// 1500118662204
        $assets = IntelligentCities::fetchNearbyAssetsData($latitude, $longitude, $time);
        $ETAModifier = DecisionTree::classify($assets);
        $GLOBALS['client_token'] = null; // Delete the token meanwhile the token validation process gets implemented
        return $ETAModifier;
    }

    /*
     * MAIN function that given a latitude and a longitude returns an Asset array which contains the environmental,
     * traffic and awareness information available on each node
     */
    public static function gatherReportData($latitude, $longitude, $time = 1500118662204){
        $nearbyAssets = IntelligentCities::fetchNearbyAssetsData($latitude, $longitude, $time, true);
        $GLOBALS['client_token'] = null; // Delete the token meanwhile the token validation process gets implemented
        return $nearbyAssets;
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

    /**
     * Function that given the unique id of an node asset, retrieves all the available sub assets on it
     **/
    private static function fetchNodeSubAssets($assetUid) {
        IntelligentCities::validateToken();

        $response = IntelligentCities::CallAPI("GET", IntelligentCities::metadata_url
            . "/assets/" . $assetUid
            . "/subAssets"
        );
        if($GLOBALS['debug'] >= DebugVerbosity::LARGE) {
            var_dump($response);
        }
        return $response;
    }

    /** Function that given the unique id of an asset, retrieves and returns the current registered event data
     * fetchAssetEvent("ENV-ATL-0009-1", 1500328704000);
     * fetchAssetEvent("CAM-ATL-0016-2", 1500118662204);
     **/
    private static function fetchAssetEvent($assetUid, $eventType, $measurementTime) {
        IntelligentCities::validateToken();

        // Time unit is in seconds, used base 6 on the delta to match time units ex: 1*60^1 = 60s, 1*60^2 = 3600s = 1h...
        $delta = 1000 * pow(60, 1); // timestamp is in milliseconds
        $start_time =   $measurementTime - $delta;
        $end_time =     $measurementTime;

        if($eventType == 'TFEVT') {
            $predixId = IntelligentCities::traffic_zone_id;
        } else {
            $predixId = IntelligentCities::env_zone_id;
        }

        $response = IntelligentCities::CallAPI("GET", IntelligentCities::eventURL
            . "/assets/" . $assetUid
            . "/events?eventType=". $eventType
            . "&startTime=" . $start_time . "&endTime=" . $end_time
        , false, true, $predixId);
        if($GLOBALS['debug'] >= DebugVerbosity::LARGE) {
            var_dump($response);
        }
        return $response;
    }

    /**
     * Function that given the unique id of an asset, the media type and a measurement time, retrieves and returns a media url
     **/
    private static function fetchAssetMedia($assetUid, $mediaType, $measurementTime) {
        IntelligentCities::validateToken();

        // Time unit is in seconds, used base 6 on the delta to match time units ex: 1*60^1 = 60s, 1*60^2 = 3600s = 1h...
        $delta = 1000 * pow(60, 1); // timestamp is in milliseconds
        $start_time =   $measurementTime - $delta;
        $end_time =     $measurementTime;
        $predixId = IntelligentCities::ps_zone_id;

        $response = IntelligentCities::CallAPI("GET", IntelligentCities::media_url
            . "/assets/" . $assetUid
            . "/media?media-types=". $mediaType
            . "&start-ts" . $start_time . "&end-ts=" . $end_time
            , false, true, $predixId);
        if($GLOBALS['debug'] >= DebugVerbosity::LARGE) {
            var_dump($response);
        }
        return $response;
    }

    /**
     * Function that given a latitude and longitude retrieves and returns an array with the nearby assets containing temperature and traffic data
     * if the $includeAwarenessData parameter is set, it will also fetch the available media from the assets.
     * fetchNearbyNodesData(33.754226,-84.396138);
     **/
    private static function fetchNearbyAssetsData($xCenter, $yCenter, $measurementTime, $includeAwarenessData = false){

        // Get the nearby nodes to the given coordinates
        $nearbyAssetsResponse = IntelligentCities::fetchNearbyAssets($xCenter, $yCenter);
        $nearbyAssetsAssociativeArray = json_decode($nearbyAssetsResponse, true);
        $assetArray = Asset::parseNodes($nearbyAssetsAssociativeArray);

        // Retrieve additional node data
        foreach ($assetArray as $asset) {
            // TODO: Do the networking calls on separate threads:
            // Temperature
            $assetTemperatureResponse = IntelligentCities::fetchAssetEvent($asset->envAssetUid,"TEMPERATURE", $measurementTime);
            $assetTemperatureData = json_decode($assetTemperatureResponse, true);
            // Humidity
            $assetHumidityResponse = IntelligentCities::fetchAssetEvent($asset->envAssetUid,"HUMIDITY", $measurementTime);
            $assetHumidityData = json_decode($assetHumidityResponse, true);
            // Pressure
            $assetPressureResponse = IntelligentCities::fetchAssetEvent($asset->envAssetUid,"PRESSURE", $measurementTime);
            $assetPressureData = json_decode($assetPressureResponse, true);
            Asset::parseNodeEnvironmentalData($asset, $assetTemperatureData, $assetHumidityData, $assetPressureData);
            // Retrieve additional Node information
            $nodeDetailsResponse = IntelligentCities::fetchNodeSubAssets($asset->parentAssetUid);
            $nodeDetailsData = json_decode($nodeDetailsResponse, true);
            Asset::parseNodeAssetDetails($asset, $nodeDetailsData);
            // Traffic
            $assetTrafficResponse = IntelligentCities::fetchAssetEvent($asset->tfevtAssetUid,"TFEVT", $measurementTime);
            $assetTrafficData = json_decode($assetTrafficResponse, true);
            Asset::parseNodeTrafficData($asset, $assetTrafficData);

            if($includeAwarenessData) {
                // Awareness
                $assetAwarenessResponse = IntelligentCities::fetchAssetMedia($asset->mediaAssetUid,"IMAGE", $measurementTime);
                $assetAwarenessData = json_decode($assetAwarenessResponse, true);
                Asset::parseNodeAwarenessData($asset, $assetAwarenessData);
            }
            if($GLOBALS['debug'] >= DebugVerbosity::MINOR) {
                var_dump($asset);
            }
        }
        return $assetArray;
    }

    /**
     * Function that given a latitude and longitude retrieves and returns an array with the nearby assets
     * fetchNearbyAssets(33.754226,-84.396138);
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

        if($GLOBALS['debug'] >= DebugVerbosity::LARGE) {
            print "Bounding box is: " . $bbox_x1 . ", " .$bbox_y1 . " : " . $bbox_x2 . ", " . $bbox_y2 . "\n";
        }
        $asset_type = "ENV_SENSOR";
        $event_type = "TEMPERATURE";
        $request_uri = "/assets/search?";

        if($GLOBALS['debug'] >= DebugVerbosity::LARGE) {
            print "Retrieving " . $xcenter . ", " . $ycenter . " nearby assets...\n";
        }

        $response = IntelligentCities::CallAPI("GET", IntelligentCities::metadata_url
            . $request_uri
            . "bbox=" . $bbox_x1 . ":" . $bbox_y1 . "," . $bbox_x2 . ":" . $bbox_y2
            . "&page=" . $page
            . "&size=" . $size
            . "&q=assetType:" . $asset_type
            . "&eventType=". $event_type
        );
        if($GLOBALS['debug'] >= DebugVerbosity::LARGE) {
            var_dump($response);
        }

        // Parse the node response
        return $response;
    }

    /** Function that checks whether the token is valid or expired and returns a boolean with true if the token is still valid **/
    private static function validateToken(){
        // TODO: Verify the token is still valid and handle exceptions such as invalid credentials
        if($GLOBALS['client_token'] == null) {
            IntelligentCities::refreshToken();
        }
    }

    /**
     * Function that calls a web service given a HTTP method, an url, data and a boolean indicating with false if its a token renew type of call
     * or true if the the token is valid and data is being retrieved from the service
     *
     * Data: array("param" => "value") ==> index.php?param=value
     * Method: POST, PUT, GET
     **/
    private static function CallAPI($method, $url, $data = false, $authenticated = true, $predixId = IntelligentCities::env_zone_id)
    {
        $curl = curl_init();
        if($GLOBALS['debug'] >= DebugVerbosity::MINOR) {
            print $url . "\n";
        }
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
                "Predix-Zone-id:". $predixId
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
