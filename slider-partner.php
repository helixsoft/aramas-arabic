<div id="wrapper">
      <div id="thumbs-wrapper">
        <div id="thumbs">
         <?php 
                    $temp_post = $post;
                    $wp_query = new WP_Query(); $wp_query->query('post_type=partner');
                    while ($wp_query->have_posts()) : $wp_query->the_post();
                    ?>
          <?php
          $thumb_id = get_post_thumbnail_id();
          $thumb_url = wp_get_attachment_image_src($thumb_id,'full', true);
          ?>
          <a class="fancybox sd" href="#inline<?php echo the_ID();?>"><img src="<?php echo $thumb_url[0];?>" /></a>
          <div id="inline<?php echo the_ID();?>" style="width:800px!important;height:auto;display: none;">
            <div class="full">
              <div class="half">
                <h1>Learn More</h1>
                <p><?php echo the_content();?></p>
              </div>
              <div class="halfn">
                <?php echo get_the_post_thumbnail($post->ID,'large') ?>
                <a href="#" target="_blank" style="text-decoration:none;float:right;color:#ff0000;"><h4>Visit Website</h4></a>
              </div>
            </div>
          </div>
          <?php
                  endwhile;
                  $post = $temp_post;
              ?> 
              </div>
        <a id="prev" href="#"></a>
        <a id="next" href="#"></a>
      </div>
    </div>