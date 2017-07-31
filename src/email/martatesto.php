<?php

error_reporting(0);

require 'Mailbox.php';
require 'IncomingMail.php';
require '__autoload.php';

$mailbox = new PhpImap\Mailbox('{imap.gmail.com:993/imap/ssl}INBOX', 'myvanislate@gmail.com', 'superlate', __DIR__);

if ((isset($_POST['emailAddress']) && isset($_POST['emailBody'])){
  $emailAddress = $_POST['emailAddress'];
  $emailBody = $_POST['emailBody'];

  mail( $emailAddress, '', $emailBody);
}
