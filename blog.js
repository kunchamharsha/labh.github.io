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

  function handleBack() {
    const currentUrl = window.location.pathname;
    const segments = currentUrl.split('/').filter(Boolean);
  
    if (segments.length <= 1) {
      window.location.href = '/';
      return;
    }
  
    segments.pop();
    const parentPath = '/' + segments.join('/');
    window.location.href = parentPath;
  }
  
