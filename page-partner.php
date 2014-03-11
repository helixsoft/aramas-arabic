<?php
/**
 * Template name: Partner Page Template 
 * The template for displaying partner pages.
 */

get_header('partner'); ?>
<div class="pcontainer clearfix">
	<div class="pcontent">
		<div class="top">
			<h1><?php echo ot_get_option( 'partner_sub_heading' );?></h1>
			<p><?php echo ot_get_option( 'partner_description' );?></p>
		</div>
		<?php get_template_part('slider-partner1')?>
	</div>		
</div>
<?php get_footer();?>
