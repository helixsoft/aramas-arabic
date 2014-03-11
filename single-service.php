<?php
/**
 * The template for displaying Single press page.
 *
 * @package Wordpress
 * @subpackage gs
 * @since gs 1.0
 */
get_header('service');?>
<div class="scontainer clearfix">
		<div class="content">
			<div class="left">
				<div class="top">
					<?php get_template_part('slider-service')?>
				</div>
				<div style="width:500px">
				<div class="slidewrap09">
					<ul class="slidecontrols" style="margin-left:442px;margin-top:20px;position:relative;top:-12px;"><!--339 -->
						<li style="float:left;text-decoration:none;"><a class="move current" href="#" data-key="0">Brands</a></li><!--<li style="float:left"><a>&nbsp;/&nbsp;</a></li>-->
						<!--<li style="float:left;text-decoration:none;"><a class="move" href="#" data-key="1">Testimonials</a></li>-->
					</ul>
					<div class="bot">		
						<ul class="slider" id="sliderName">
							<li class="slide">	
								<?php get_template_part('slider-partner')?> 
							</li>
							<li class="slide">	
								<p style="margin-left:10px;"><?php echo get_field('testimonials')?></p>
							</li>			
						</ul>
					</div>
				</div>
				</div>
			</div>	
			<div class="right">
				<div class="up">
					<h1><?php _e('What you need to know','aramas')?></h1>
					<p><?php echo get_post_field('post_content', $post_id);?></p>
				</div>
				<div class="down">
					<h2>Get in Touch</h2>
		            <div class="down-contact-form">
		            	<form id="contact-us" action="" method="post" name="contactForm">
		                 	<input type="text" name="name" value="" class="txt white requiredField" placeholder="NAME">
		                 	<textarea class="txtarea requiredField white" name="message" cols="30" rows="10" placeholder="MESSAGE"></textarea>
		                 	<input type="email" name="email" value="" class="txt white requiredField email" placeholder="EMAIL">
							<input type="submit" name="submit" value="Submit">
		                	<input type="hidden" name="submitted" id="submitted" value="true">
		                	 <div class="success-message">Email has been sent!</div>
                                <div class="alert-message"></div>
                                <div class="error-message">Email could not be delivered. Please try again later!</div>
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
				                  
				                  var processor = "<?php echo get_template_directory_uri(); ?>/contact.php",
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
			</div>	
		</div>
</div>	 
<?php
get_footer();
?>
