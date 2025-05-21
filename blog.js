function sharePage() {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href
      }).catch(console.error);
    } else {
      alert('Sharing not supported in this browser.');
    }
  }

  function investnow()
  {
    
  }