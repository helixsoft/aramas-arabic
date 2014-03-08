<?php

/**

 * Template name: Home Page Template 

 * The template for displaying about pages.

 */



get_header('headername');

?>

<div class="tcontainer clearfix">		

	<div class="left">

			<div class="c1">

			   <div class="slidewrap20" data-autorotate="4000">

			      <ul class="slider">

			       <?php 

			              $temp_post = $post;

			              $wp_query = new WP_Query(); $wp_query->query('post_type=promotion');

			              while ($wp_query->have_posts()) : $wp_query->the_post();

			              ?>

			        <li class="slide">  

			           <a href="<?php bloginfo('url')?>/group" ><?php echo get_the_post_thumbnail($post->ID,'full-size');?></a>

			        </li>

			        <?php

			              endwhile;

			              $post = $temp_post;

			            ?> 

			      </ul>

			      <ul class="slidecontrols" role="navigation">  

			        <li role="presentation">

			          <a href="#carousel-4-0" class="as-next"></a>

			        </li> 

			          <li role="presentation">

			            <a href="#carousel-4-0" class="as-prev"></a>

			          </li>

			        </ul>

  				</div>

			</div>

		<div class="c2">

				<div class="slidewrap4" data-autorotate="4000">

			      <ul class="slider">

			       <?php 

			              $temp_post = $post;

			              $wp_query = new WP_Query(); $wp_query->query('post_type=service');

			              while ($wp_query->have_posts()) : $wp_query->the_post();

			              ?>

			        <li class="slide">  

			         <a href="<?php bloginfo('url')?>/services" ><?php echo get_the_post_thumbnail($post->ID,'full-size');?></a>

			        </li>

			        <?php

			              endwhile;

			              $post = $temp_post;

			            ?> 

			      </ul>

			      <ul class="slidecontrols" role="navigation">  

			        <li role="presentation">

			          <a href="#carousel-4-0" class="as-next"></a>

			        </li> 

			          <li role="presentation">

			            <a href="#carousel-4-0" class="as-prev"></a>

			          </li>

			        </ul>

  				</div>

		</div>

		<div class="c3">

				<div class="slidewrap4" >

			      <ul class="slider">

			       <?php 

			              $temp_post = $post;

			              $wp_query = new WP_Query(); $wp_query->query('post_type=faq');

			              while ($wp_query->have_posts()) : $wp_query->the_post();

			              ?>

			        <li class="slide">  

			          <h1><?php the_title();?></h1>

			          <p><?php the_excerpt();?></p>

			        </li>

			        <?php

			              endwhile;

			              $post = $temp_post;

			            ?> 

			      </ul>

			      <ul class="slidecontrols" role="navigation">  

			        <li role="presentation">

			          <a href="#carousel-4-0" class="as-next"></a>

			        </li> 

			          <li role="presentation">

			            <a href="#carousel-4-0" class="as-prev"></a>

			          </li>

			        </ul>

  				</div>

		</div>

		<div class="c4">

			<div class="l">

			<h1><?php echo ot_get_option( 'live_feed' );?></h1>

			</div>

			<div class="r">

			<div class="slidewrap4" data-autorotate="4000">

			      <ul class="slider">

			       <?php 

			              $temp_post = $post;

			              $wp_query = new WP_Query(); $wp_query->query('post_type=livefeed');

			              while ($wp_query->have_posts()) : $wp_query->the_post();

			              ?>

			        <li class="slide">  

			          <p>

			          	<?php $myExcerpt = get_the_content();

						  $tags = array("<p>", "</p>");

						  $myExcerpt = str_replace($tags, "", $myExcerpt);

						  echo $myExcerpt;?></p>

			        </li>

			        <?php

			              endwhile;

			              $post = $temp_post;

			            ?> 

			      </ul>

			      <ul class="slidecontrols" role="navigation">  

			        <li role="presentation">

			          <a href="#carousel-4-0" class="as-next"></a>

			        </li> 

			          <li role="presentation">

			            <a href="#carousel-4-0" class="as-prev"></a>

			          </li>

			        </ul>

  				</div>

  			</div>	

		</div>

		<div class="c5">

			<div class="col">

				<h1><?php echo ot_get_option( 'partner_heading' );?></h1>

				<p><?php echo ot_get_option( 'partner_sub_heading' );?></p>

			</div>

			<div class="div"></div>

			<div class="col">

			<div class="slidewrap4" data-autorotate="4000">

			      <ul class="slider">

			       <?php 

			              $temp_post = $post;

			              $wp_query = new WP_Query(); $wp_query->query('post_type=partner');

			              while ($wp_query->have_posts()) : $wp_query->the_post();

			              ?>

			        <li class="slide">  

			         <a href="http://ar.mizalabs.com/partners/"> <?php echo get_the_post_thumbnail($post->ID,'full-size');?></a>

			        </li>

			        <?php

			              endwhile;

			              $post = $temp_post;

			            ?> 

			      </ul>

			      <ul class="slidecontrols" role="navigation">  

			        <li role="presentation">

			          <a href="#carousel-4-0" class="as-next"></a>

			        </li> 

			          <li role="presentation">

			            <a href="#carousel-4-0" class="as-prev"></a>

			          </li>

			        </ul>

  				</div>

			</div>

		</div>

	</div>

	<div class="right">

		<div class="hedr">

			<h1><?php _e(' &#1575;&#1604;&#1605;&#1583;&#1608;&#1606;&#1577;','aramas')?></h1>

		</div>

		<div class="content">

			<div class="slidewrap" data-autorotate="4000">

				<ul class="slider">

				  <?php 

			              $temp_post = $post;

			              $wp_query = new WP_Query(); $wp_query->query('post_type=post');

			              while ($wp_query->have_posts()) : $wp_query->the_post();

			              ?>

				<a href="http://ar.mizalabs.com/blog/" style="text-decoration:none;color:#111;font-size:20px;"><li class="slide">

						<?php echo get_the_post_thumbnail($post->ID, 'full-size'); ?>	

						<div class="po">

						<h2><?php echo get_the_title();?></h2>

						<p><?php the_excerpt();?></p>

						</div>

					</li></a>

				 <?php

			              endwhile;

			              $post = $temp_post;

			            ?> 	

				</ul>

				<ul class="slidecontrols">

					<li><a href="#" class="next"><img src="<?php echo THEMEROOT?>/images/blg1.png"style="width:10px;height:10px;"></a></li>

					<li><a href="#" class="prev"><img src="<?php echo THEMEROOT?>/images/blg2.png"style="width:10px;height:10px;"></a></li>

				</ul>

			</div>

		</div>

	</div>

</div>

<?php get_footer();?>