<?php
/**
 * Template name: Contact Page Template 
 * The template for displaying contact pages.
 */

get_header('service'); ?>
<?php /* The loop */ ?>
<?php while ( have_posts() ) : the_post(); ?>
<div class="ccontainer">
		<div class="content">
			<div class="top">
				<p><?php echo ot_get_option( 'contact_description' );?></p>
			</div>
			<div class="contact-body">
		<div class="contact-body-left">
			<h2>Get in Touch</h2>
            <div class="contact-form">
            	<?php the_content();?>
            	<form id="contact-us" action="" method="post" name="contactForm">
					<input type="text" name="fname" value="" class="txt" placeholder="FIRST NAME">
					<input type="text" name="lname" value="" class="txt" placeholder="LAST NAME">
					<input type="email" name="email" value="" class="txt" placeholder="EMAIL">
					<input type="text" name="phone" value=""  class="txt" placeholder="PHONE NUMBER">
					<textarea name="message" cols="40" rows="10" class="txtarea" placeholder="MESSAGE"></textarea>
					<input type="submit" value="Send">
					<div class="success-message black">Email has been sent!</div>
                    <div class="alert-message black"></div>
                    <div class="error-message black">Email could not be delivered. Please try again later!</div>
				</form>
				<script type="text/javascript">
		                 $(document).ready(function(){
		                 	/* form processing */
				            $("#contact-us").submit(function(){
				                  
				                  $(this).find('[placeholder]').each(function() {
				                        
				                        var input = $(this);
				                        if (input.val() == input.attr('placeholder')) {
				                              input.val('');
				                        }
				                        
				                  });
				                  
				                  var processor = "<?php echo get_template_directory_uri(); ?>/contact-box.php",
				                        str = $(this).serialize();
				                  
				                  $("#contact-us .success-message, #contact-us .alert-message, #contact-us .error-message ").hide();
				                  
				                  $.ajax({
				                           
				                     type: "POST",
				                     url: processor,
				                     data: str,
				                     success: function(data) {
				                              
				                              //console.log(data);
				                              $("#contact-form").append('<span class="feedback"></span>');
				                                                   
				                              if(data === 'OK') {
				                              
				                                    $("#contact-us .success-message").fadeIn();
				                                    $("#contact-us").each(function(){
				                                          this.reset();
				                                    });
				                                
				                              } else if (data === 'ERROR') {
				                              
				                                    $("#contact-us .error-message").fadeIn();
				                              
				                              } else {
				                                    
				                                    $("#contact-us .alert-message").fadeIn().html( data );
				                                    
				                              }
				                           
				                     }
				                           
				                  });
				            
				                  return false;
				                  
				            });
		                 });
		                </script>
            </div>
		</div>
		<div class="contact-body-right">
			<h1><?php echo ot_get_option( 'contact_address_first' );?> </h1>
			<h1><?php echo ot_get_option( 'contact_address_second' );?> </h1>
			<h1><?php echo ot_get_option( 'contact_address_phone' );?></h1>
			<div class="img"></div>
		</div>
	</div>
		</div>
</div>		
<?php endwhile;?>
<?php get_footer();?>