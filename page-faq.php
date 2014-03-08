<?php
/**
 * Template name: FAQ Page Template 
 * The template for displaying faq pages.
 */

get_header('service'); ?>
<div class="fcontainer clearfix">
		<div class="container">
			<div class="content faq">
							<?php $wp_query_faq = new WP_Query(); ?>
		          <?php $wp_query_faq->query('post_type=faq&posts_per_page=9999&post_status=publish'); ?>
		          <?php if ( $wp_query_faq->have_posts() ) : ?>
		          <?php /* Start the Loop */ ?>
		          <?php while ( $wp_query_faq->have_posts() ) : $wp_query_faq->the_post(); ?>
			

				
					<div class="heading clearfix">
						<div class="button"></div>
						<h4><?php the_title();?></h4>
						<div class="description"><?php the_content();?></div>
					</div>
				
			
			 <?php endwhile;endif;?>
			 </div>
		 </div>	
</div>
<?php get_footer();?>