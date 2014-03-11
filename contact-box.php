<?php 
	include('../../../wp-load.php');
	$fname = $_POST['fname'];
  $lname = $_POST['lname'];
  $phone = $_POST['phone'];
  $email = $_POST['email'];
  $message = $_POST['message'];

  	//php mailer variables
  	$to = get_option('admin_email');
  	$subject = "Someone sent a message from ".get_bloginfo('name');
  	$headers = 'From: '. $email . "\r\n" .
    'Reply-To: ' . $email . "\r\n";
    if(empty($fname) || empty($lname) || empty($phone)|| empty($message) || empty($email)){
      echo "Please supply all information.";
    }else if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
    	echo "Email Address Invalid.";
    }else{
          $name = $fname.$lname;
          $sent = wp_mail($to, $subject, strip_tags($message).'Name:'.$name.'\n'.'Phone:'.$phone, $headers);
          if($sent) echo "OK"; //message sent!
          else echo "ERROR"; //message wasn't sent
    }