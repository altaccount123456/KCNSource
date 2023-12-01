const images = document.querySelectorAll('.slideshow-image');
let currentIndex = 0;

function slideshow() {
  setTimeout(() => {
    images[currentIndex].classList.remove('image-zoom');
  }, 300)
  images[currentIndex].style.opacity = 0;

  currentIndex = (currentIndex + 1) % images.length;

  setTimeout(() => {
      images[currentIndex].style.opacity = 0.3;
      setTimeout(() => {
          images[currentIndex].classList.add('image-zoom');
      }, 100); 
  }, 1000); 
}
slideshow();
let slideshowInterval = setInterval(slideshow, 10000);
let subtextIndex = 0;
const subtitle = document.getElementById('random-subtext');
let subtext_words = ["Stream weather, news and more on our platform.", "Flexible video streaming allowing to stream to five simultaneous streaming platforms.","Not only video—we also provide icecast audio only streaming.","label maker","By the broadcast enthusiasts... for the broadcast enthusiast! (and probably others.)","All KCN services are provided free of charge."];

function animateSubtext() {
  const subtextSpans = subtitle.querySelectorAll('span');
  const currentSpan = subtextSpans[subtextIndex];
  const nextSpan = subtextSpans[(subtextIndex + 1) % subtextSpans.length];
  currentSpan.style.opacity = 0;
  nextSpan.style.opacity = 0.5;
  subtextIndex = (subtextIndex + 1) % subtext_words.length;
}

animateSubtext();
document.getElementById("navbar").style.backgroundColor = "transparent"
setInterval(animateSubtext, 10000);

window.onscroll = function() {
  var scrollPosition = window.scrollY; 

  if (scrollPosition < thresh) {
      document.getElementById("navbar").style.backgroundColor = "transparent"
  } else if(scrollPosition > thresh) {
    document.getElementById("navbar").style.backgroundColor = "#212121"
  }
};

var thresh = 100; 
