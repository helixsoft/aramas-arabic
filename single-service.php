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
				<div class="slidewrap09" data-autorotate="5000" style="height:200px;">
		<ul class="slidecontrols" style="margin-left:350px;margin-top:20px;">
			<li style="float:left;text-decoration:none;"><a href="#sliderName" class="next active" style="text-decoration:none;color:#6A6B66;">Brands</a></li><li style="float:left"><a>/</a></li>
			<li style="float:left;text-decoration:none;"><a href="#sliderName" class="prev" style="text-decoration:none;color:#9a8e55;">Testimonials</a></li>
		</ul>
				<div class="bot">
					
		<ul class="slider" id="sliderName">
			<li class="slide">	
				<?php get_template_part('slider-partner')?> 
			</li>
			<li class="slide">	
				<p style="margin-left:10px;">In hac habitasse platea dictumst. Nam pulvinar, odio sed rhoncus suscipit, sem diam ultrices mauris, eu consequat purus metus eu velit. Proin metus odio, aliquam eget molestie nec, gravida ut sapien.</p>
			</li>			
		</ul>
	</div>
					<!--<?php get_template_part('slider-partner')?>-->   
				</div>
			</div>
<div class="liner"></div>	
			<div class="right">
				<div class="up">
					<h1><?php _e('What you need to know','aramas')?></h1>
					<p><?php echo get_post_field('post_content', $post_id);?></p>
				</div>
				<div class="down">
					<h2><?php _e('تواصل معنا','aramas')?></h2>
		            <div class="down-contact-form">
		            	<form id="contact-us" action="" method="post" name="contactForm">
		                 	<input type="text" name="name" value="" class="txt requiredField" placeholder="الأسم الأول">
		                 	<textarea class="txtarea requiredField" name="message" cols="30" rows="10" placeholder="الرسالة"></textarea>
		                 	<input type="email" name="email" value="" class="txt requiredField email" placeholder="البريد الالكتروني">
							<input type="submit" name="submit" value="Submit">
		                	<input type="hidden" name="submitted" id="submitted" value="true">
		                </form>
		            </div>
				</div>
			</div>	
		</div>
</div>	 
<?php
get_footer();
?>