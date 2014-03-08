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
			<h2> <?php _e('تواصل معنا','aramas')?></h2>
            <div class="contact-form">
            	<?php the_content();?>
            </div>
		</div>
		<div class="contact-body-right">
			<h1><?php echo ot_get_option( 'contact_address_first' );?> </h1>
			<h1><?php echo ot_get_option( 'contact_address_second' );?> </h1>
			<h1><?php echo ot_get_option( 'contact_address_phone' );?></h1>
			 <div class="img">
                                 <div class="line"></div>
                                <img src="<?php echo ot_get_option( 'contact_info_scan' );?>">
                                <p>Scan to save our contact information </p>
                             </div>
		</div>
	</div>
		</div>
</div>		
<?php endwhile;?>
<?php get_footer();?>