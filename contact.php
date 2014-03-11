<?php 
	include('../../../wp-load.php');
	$name = $_POST['name'];
  	$email = $_POST['email'];
  	$message = $_POST['message'];

  	//php mailer variables
  	$to = get_option('admin_email');
  	$subject = "Someone sent a message from ".get_bloginfo('name');
  	$headers = 'From: '. $email . "\r\n" .
    'Reply-To: ' . $email . "\r\n";
    if(empty($name) || empty($message) || empty($email)){
      echo "Please supply all information.";
    }else if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
    	echo "Email Address Invalid.";
    }else{
          $sent = wp_mail($to, $subject, strip_tags($message).'Name:'.$name, $headers);
          if($sent) echo "OK"; //message sent!
          else echo "ERROR"; //message wasn't sent
    }