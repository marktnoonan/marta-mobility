<?php

namespace Paratransit;
use \Interop\Container\ContainerInterface;
require_once(__DIR__ . '/../vendor/simple-html-dom/simple-html-dom/simple_html_dom.php');

class MartaScraper
{
    protected $c;
    private $currentDay;
    private $currentTime;
    private $currentTimeInMinutes;
    private $tomorrow;

    public function __construct(ContainerInterface $container)
    {
        $this->c = $container;
        $this->currentDay = date('m-d-Y'); // m includes leading zero, we need this for comparison later.
        $this->tomorrow = date("m-d-Y", strtotime('tomorrow'));
        $this->currentTime = explode(":", date('H:i'));
        $this->currentTimeInMinutes = (intval($this->currentTime[0]) * 60) + intval($this->currentTime[1]);
    }

    public function getData()
    {
        $data = [];
        $html = $this->getMartaPage();
        $cancelledTripExists = null;

        $customerInfo = $html->find('div[class=portletContent even]', 0);
        $data['clientName'] = is_object($customerInfo) ? strip_tags($customerInfo->plaintext) : '';
        
        $bookingIDs = $html->find('td[class=tripHeader]');
        $arrayOfBookings = $this->getBookings($bookingIDs);
        if (is_object($something = $html->find('span[class=Cancelled]', 0)) && $something->plaintext !== null) {
            $cancelledTripExists = $html->find('span[class=Cancelled]', 0)->plaintext;
            array_shift($arrayOfBookings);
        }
        $data['cancelled checker'] = $cancelledTripExists === null;
        
        $datesAndTimes = $html->find('td[valign=middle]');
        $arrayOfBookings = $this->datesAndTimes($arrayOfBookings, $datesAndTimes);
        
        // this locates the "Past Trip" status, which can tell us that the bus has registered that the client was picked up.
        if (is_object($something = $html->find('span[class=smallbold]', 0)) && $something->plaintext !== "") {
            $data["Past trip found"] = true;
        } else {
            $data["Past trip found"] = false;
        }
        $locations = $html->find('td[width=5]');
        $arrayOfBookings = $this->locations($arrayOfBookings, $locations, $cancelledTripExists);
        
        $arrayOfBookings = $this->removePastBookings($arrayOfBookings);
        $data['bookings'] = $arrayOfBookings;
        // so we actually CAN get the latlong, though it is buried deeply within this hidden form field.
        // I will have to write a parser function. TODO
        $latLongForFirstPickup = $html->find("input[name=PickUpAddress]", 1);
        $latLongForFirstPickup = $this->getLatLong($latLongForFirstPickup);
        $data['Pick Up location data'] = $latLongForFirstPickup;
        $data['Pickup Long'] = $latLongForFirstPickup;
        $data['updatedAt'] = date('g:i A');
        return $data;
    }

    protected function getMartaPage()
    {
        if ($this->c['auth']->getUsername() === 'test') {
            $html = file_get_html(__DIR__ . '/../wwwdocs/MARTAEXAMPLE.html', false, null, 0);
        } else {
            $html = $this->fetchMartaPage();
        }
        return $html;
    }

    protected function fetchMartaPage()
    {
        $curl = $this->c['curl'];
        $cookies = $this->c['auth']->getMartaCookies();
        curl_setopt($curl, CURLOPT_URL, 'http://mobility.itsmarta.com/hiwire?.a=pViewTrips&.s=8ff56be8');
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        if(count($cookies) > 0){
            $cookieBuffer = array();
            foreach($cookies as $id=>$cookie) {
                $cookieBuffer[] = "$id=$cookie";
            }
            curl_setopt($curl, CURLOPT_COOKIE, implode("; ", $cookieBuffer));
        }
        $html = str_get_html(curl_exec($curl));
        return $html;
    }

    private function getBookings($bookingIDs)
    {
        $i = 0;
        foreach ($bookingIDs as $bookingID) {
            // substring removes string "Booking ID: " from the found plaintext.
            $arrayOfBookings[$i]["bookingID"] = substr($bookingID->plaintext, 12);
            $arrayOfBookings[$i]["iteratorBookingID"] = $i;
            $i++;
        }
    }
    
    private function formatTime($time) {
        // removing the leading space on shorter times
        $time = preg_replace("/ /", "", $time);
    
        if (mb_strlen($time) === 4) {
            $time = "0" . $time;
            return $time;
        } else {
            return $time;
        }
    }
    
    private function datesAndTimes($arrayOfBookings, $datesAndTimes)
    {
    
        $i = 0;
        foreach ($datesAndTimes as $dateOrTimeNugget) {
            // nuggets are what we pull out of the DOM, all need a little different parsing.
            $nugget = $dateOrTimeNugget->plaintext;
            if (strpos($nugget, 'Ready')) {
                $eta = substr($nugget, 35, 5);
                //using the preg_replace because the time is not always 5 chars long... eg 7:05 vs 10:05. But sometimes it is, so we need to catch 5 chars anyway. And just remove the line break char if we capture it.
                $eta = preg_replace("/\r/", "", $eta);
                $eta = $this->formatTime($eta);
                $displayEta =  date("g:i A", strtotime($eta));
                $arrayOfBookings[$i]["eta"] = $eta;
                $arrayOfBookings[$i]["displayEta"] = $displayEta;
                $arrayOfBookings[$i]["iteratorreadynugget"] = $i;
            } elseif (strpos($nugget, 'ate')) {
                $tripDate = substr($nugget, 6);
                // we need to replace the hyphens with slashes to get correct results from the strtotime function. If we don't, it returns day of the week based on European format.
                $displayDate = str_replace("-", "/", $tripDate);
                $displayDate = date("l", strtotime($displayDate));
                if ($tripDate === $this->currentDay){
                    $displayDate = "Today";
                }
                if ($tripDate === $this->tomorrow) {
                    $displayDate = "Tomorrow";
                }
    
                $arrayOfBookings[$i]["displayDate"] = $displayDate;
                $arrayOfBookings[$i]["date"] = $tripDate;
                $arrayOfBookings[$i]["iteratorDate"] = $i;
            } elseif (strpos($nugget, 'tart')) {
                $readyTime = $this->formatTime(substr($nugget, 14));
                $displayReadyTime =  date("g:i A", strtotime($readyTime));
                $arrayOfBookings[$i]['readyTime'] = $readyTime;
                $arrayOfBookings[$i]["displayReadyTime"] = $displayReadyTime;
                $arrayOfBookings[$i]["iteratorreadyTime"] = $i;
            } elseif (strpos($nugget, 'nd Window')) {
                $formattedEndWindow = $this->formatTime(substr($nugget, 12));
                $displayEndWindow =  date("g:i A", strtotime($formattedEndWindow));
                $arrayOfBookings[$i]['displayEndWindow'] = $displayEndWindow;
                $arrayOfBookings[$i]['endWindow'] = $formattedEndWindow;
            } elseif (strpos($nugget, 'Booked')) {
                // this is awlays the last in the set we are looking for, so we increment $i here.
                //this plaintext has a trailing space, so we remove it.
                $status = preg_replace("/ /", "", substr($nugget, 17));
                $arrayOfBookings[$i]["Status"] = $status;
                $i++;
            }
    
        }
        return $arrayOfBookings;
    }
    
    
    private function locations($arrayOfBookings, $locations, $cancelledTripExists)
    {    
      /*
      $locations is tricky - the td[width=5] is a spacer and it's only used between
      the labels "Pick-up" and "Drop-off" and the addresses... so it works as a reference point and we can grab the information from the prev_sibling and
      next_sibling. This is daft but it works.
       */
    
        // this two-part loop is Trouble and includes these continue statements to ignore trip data if a trip is cancelled.
    
        //TODO: handle cancelled trips better!
        $i = 0;
        foreach ($locations as $location) {
            if($location->prev_sibling()->plaintext === "Pick-up:"){
                if ($cancelledTripExists !== null){
                    $cancelledTripExists = "halfway there!";
                    continue;
    
                }
                $arrayOfBookings[$i]["pickupAddress"] = $location->next_sibling()->plaintext;
                $arrayOfBookings[$i]["iteratorLocation"] = $i;
    
            }
            elseif ($location->prev_sibling()->plaintext === "Drop-off: ") {
                if ($cancelledTripExists === "halfway there!"){
                    $cancelledTripExists = null;
                    continue;
                }
                $arrayOfBookings[$i]["dropOffAddress"] = $location->next_sibling()->plaintext;
                $i++;
    
            }
        }
        return $arrayOfBookings;
    }
    
    private function removePastBookings($arrayOfBookings)
    {    
        /*
        loop through $arrayOfBookings and find ones where date is today, and if the ETA
        is more than an hour old, remove the trip from the list.
        */
        foreach ($arrayOfBookings as &$booking) {
    
            $bookingEta = explode(":", $booking["eta"]);
            $bookingEtaInMinutes = (intval($bookingEta[0]) * 60) + intval($bookingEta[1]);
            $booking["currentDay"] = $this->currentDay;
            $booking["currentTimeInMinutes"] = $this->currentTimeInMinutes;
            $booking["etaInMinutes"] = $bookingEtaInMinutes;
            $booking["math"] = ($bookingEtaInMinutes + 60) < $this->currentTimeInMinutes;
    
            if ($booking["date"] === $this->currentDay && (($bookingEtaInMinutes + 60) < $this->currentTimeInMinutes)) {
    
                array_shift($arrayOfBookings);
    
            }
        }
        return $arrayOfBookings;
    }
    
    private function getLatLong($latLong)
    {
        $latLong = $latLong->value;
        $latLong = explode(";", $latLong);
        $firstPickupLong = substr($latLong[2], 2);
        return $firstPickupLong;
    }
    
}