<?php
require_once 'IntelligentCities.php';

// TODO: Properly UnitTest by asserting function results
runIntelligentCitiesIntegrationTests();

function runIntelligentCitiesIntegrationTests() {
    testDetermineETADelay();
    //testGatherReportData();
}

function testDetermineETADelay() {
    IntelligentCities::determineETADelay(33.754226,-84.396138);
}

function testGatherReportData() {
    IntelligentCities::gatherReportData(33.754226,-84.396138);
}