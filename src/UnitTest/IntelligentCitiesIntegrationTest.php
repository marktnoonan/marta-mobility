<?php
require_once 'IntelligentCities.php';

// TODO: Properly UnitTest by asserting function results
runIntelligentCitiesIntegrationTests();

function runIntelligentCitiesIntegrationTests() {
    //testDetermineETADelay();
    testGatherReportData();
    //testDistanceBetweenCoordinates();
}

function testDetermineETADelay() {
    $ETAModifier = IntelligentCities::determineETADelay(33.754226,-84.396138);
    var_dump($ETAModifier);
}

function testGatherReportData() {
    $assets = IntelligentCities::gatherReportData(33.754226,-84.396138);
    var_dump($assets);
}

function testDistanceBetweenCoordinates() {
    // Perimeter mall at Atlanta
    $userLatitude = 33.923667;
    $userLongitude =  -84.341773;

    // Regal Cinemas (not so close)
    $latitudeFurthest = 33.932160;
    $longitudeFurthest = -84.348247;

    // Chick-fill-A (really close)
    $latitudeClosest = 33.921112;
    $longitudeClosest = -84.341685;

    $greatestDistance = IntelligentCities::distanceBetweenCoordinates($userLatitude, $userLongitude, $latitudeFurthest, $longitudeFurthest);
    $shortestDistance = IntelligentCities::distanceBetweenCoordinates($userLatitude, $userLongitude, $latitudeClosest, $longitudeClosest);

    if ($greatestDistance < $shortestDistance) {
        print "TestDistanceBetweenCoordinates failed: " . ($greatestDistance > $shortestDistance) . "\n";
    }
    assert($greatestDistance > $shortestDistance);
}