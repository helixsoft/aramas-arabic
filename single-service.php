<?php
/**
 * The template for displaying Single press page.
 *
 * @package Wordpress
 * @subpackage gs
 * @since gs 1.0
 */
get_header('single-service');?>
<div class="scontainer clearfix">
		<div class="content">
			<div class="right">
				<div class="up" style="direction:RTL;">
					<h1><?php _e('ما تحتاج إلى معرفته','aramas')?></h1>
					<p><?php echo get_post_field('post_content', $post_id);?></p>
				</div>
				<div class="down">
					<h2><?php _e('تواصل معنا','aramas')?></h2>
		            <div class="down-contact-form">
		            	<form id="contact-us" action="" method="post" name="contactForm">	
		                 	<input type="text" name="name" value="" class="txt white requiredField" style="direction:RTL;" placeholder="الاسم">
		                 	<textarea class="txtarea requiredField white" name="message" cols="30" style="direction:RTL;" rows="10" placeholder="رسالة"></textarea>
		                 	<input type="email" name="email" value="" class="txt white requiredField email" style="direction:RTL;" placeholder="البريد الإلكتروني">
							<input type="submit" name="submit" value="أرسل">
		                	<input type="hidden" name="submitted" id="submitted" value="true">
		                	 <div class="success-message"><?php _e("تم ارسال البريد الالكتروني!","aramas"); ?></div>
                                <div class="alert-message"></div>
                                <div class="error-message"><?php _e("تعذر تسليم البريد الإلكتروني. يرجى المحاولة مرة أخرى في وقت لاحق!","aramas");?></div>
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
			<div class="left">
				<div class="top">
					<?php get_template_part('slider-service')?>
				</div>
				<div style="width:500px;margin-left:20px">
				<div class="slidewrap09">
					<ul class="slidecontrols" style="margin-left:380px;margin-top:20px;position:relative;top:-12px;"><!--339 -->
						<li style="float:left;text-decoration:none;"><a class="move current" href="#" data-key="0"><?php _e('التجارية العلامات','aramas');?></a></li><!--<li style="float:left"><a>&nbsp;/&nbsp;</a></li>-->
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
		</div>
</div>	 
<?php
get_footer();
?>
