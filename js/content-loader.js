function loadContent(page, cssFile) {
    fetch(page)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('content').innerHTML = data;
            loadCSS(cssFile);
        })
        .catch(error => {
            console.error('Error loading content:', error);
            document.getElementById('content').innerHTML = '<p>Sorry, the content could not be loaded.</p>';
        });
}

function loadCSS(cssFile) {
    if (cssFile) {
        const existingLink = document.querySelector('link[data-dynamic="true"]');
        if (existingLink) {
            existingLink.remove();
        }

        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssFile;
        link.setAttribute('data-dynamic', 'true');
        document.head.appendChild(link);
    }
}

function loadIndexContent() {
    fetch('main.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            document.getElementById('content').innerHTML = html;
        })
        .catch(error => {
            console.error('There was a problem fetching the content:', error);
        });

    const existingLink = document.querySelector('link[data-dynamic="true"]');
    if (existingLink) {
        existingLink.remove();
    }
}

function loadContentFromAnchor() {
    const hash = window.location.hash;
    if (hash) {
        if (hash.startsWith("#")) {
            if (hash === "#") {
                loadIndexContent();
            } else {
                const page = hash.substring(1) + ".html";
                const cssFile = "css/" + hash.substring(1) + ".css";
                loadContent(page, cssFile);
            }
        }
    } else {
        loadIndexContent();
    }
}

window.addEventListener("DOMContentLoaded", loadContentFromAnchor);
window.addEventListener("hashchange", loadContentFromAnchor);
