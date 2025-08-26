document.addEventListener('DOMContentLoaded', () => {
    const DISCORD_ID = '658259140141121536';

    const enterOverlay = document.getElementById('enter-overlay');
    const profileCard = document.querySelector('.profile-card');
    const musicPlayer = document.querySelector('.music-player');
    const music = document.getElementById('background-music');
    const video = document.getElementById('bg-video');

    const musicToggle = document.getElementById('music-toggle');
    const musicIcon = musicToggle.querySelector('i');
    const volumePanel = document.getElementById('volume-panel');
    const volumeSlider = document.getElementById('volume-slider');
    const volumePercentage = document.getElementById('volume-percentage');
    music.volume = 0.5;
    const updateVolumeIcon = () => {
        musicIcon.classList.remove('fa-volume-off', 'fa-volume-xmark', 'fa-volume-low', 'fa-volume-high');
        if (music.muted || music.volume === 0) musicIcon.classList.add('fa-volume-xmark');
        else if (music.volume < 0.5) musicIcon.classList.add('fa-volume-low');
        else musicIcon.classList.add('fa-volume-high');
    };
    musicToggle.addEventListener('click', () => {
        volumePanel.classList.toggle('hidden');
        volumePanel.classList.toggle('visible');
    });
    volumeSlider.addEventListener('input', () => {
        music.volume = parseFloat(volumeSlider.value);
        volumePercentage.textContent = `${Math.round(music.volume * 100)}%`;
        updateVolumeIcon();
    });

    const updateViewCounter = () => {
        const namespace = 'skunkyy-profile';
        const key = 'views';
        
        fetch(`https://api.counterapi.dev/v1/${namespace}/${key}/up`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('view-count').textContent = data.count;
            })
            .catch(error => {
                console.error('Error fetching view count:', error);
                document.getElementById('view-count').textContent = 'Error';
            });
    };

    window.addEventListener('load', () => {
    // Oryginalny tytuł z dodatkowymi spacjami i separatorem dla płynnego efektu
    const originalTitle = "skunkyy__ | Profile "; 
    let title = originalTitle;

    setInterval(() => {
        // Przesuń pierwszy znak na koniec całego tekstu
        title = title.substring(1) + title.substring(0, 1);
        
        // Ustaw nowy tytuł w dokumencie
        document.title = title;
    }, 300); // Zmień prędkość przewijania tutaj (mniejsza wartość = szybciej)
    });

    const enterSite = () => {
        enterOverlay.style.opacity = '0';
        setTimeout(() => enterOverlay.style.display = 'none', 500);

        video.play();
        music.play();

        profileCard.classList.add('visible');
        musicPlayer.classList.add('visible');
        
        connectLanyard();
        updateViewCounter();
    };

    document.addEventListener('click', enterSite, { once: true });
    document.addEventListener('keydown', enterSite, { once: true });

    const avatarEl = document.getElementById('avatar');
    const nicknameEl = document.getElementById('nickname');
    const usernameEl = document.getElementById('username');
    const statusIndicatorEl = document.getElementById('status-indicator');
    const activitiesContainerEl = document.getElementById('activities-container');

    const connectLanyard = () => {
        const ws = new WebSocket('wss://api.lanyard.rest/socket');
        ws.onopen = () => ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: DISCORD_ID } }));
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.op === 1) setInterval(() => ws.send(JSON.stringify({ op: 3 })), data.d.heartbeat_interval);
            else if (data.op === 0) updateProfile(data.d);
        };
        ws.onclose = () => setTimeout(connectLanyard, 5000);
        ws.onerror = (error) => { console.error('Lanyard WebSocket error:', error); ws.close(); };
    };

    const updateProfile = (d) => {
        const avatarUrl = d.discord_user.avatar ? `https://cdn.discordapp.com/avatars/${d.discord_user.id}/${d.discord_user.avatar}.${d.discord_user.avatar.startsWith('a_') ? 'gif' : 'png'}` : 'https://i.imgur.com/qmW1gVz.png';
        if (avatarEl.src !== avatarUrl) avatarEl.src = avatarUrl;
        
        nicknameEl.textContent = d.discord_user.global_name || d.discord_user.username;
        usernameEl.textContent = `@${d.discord_user.username}`;
        statusIndicatorEl.className = d.discord_status || 'offline';

        activitiesContainerEl.innerHTML = '';
        if (d.activities && d.activities.length > 0) {
            d.activities.forEach((activity, index) => {
                if (activity.type === 4) return;
                
                if (activity.name === 'Spotify') {
                    const spotifyDiv = document.createElement('div');
                    spotifyDiv.className = 'spotify-activity';
                    spotifyDiv.style.animationDelay = `${index * 120 + 500}ms`;
                    const albumArtUrl = `https://i.scdn.co/image/${activity.assets.large_image.replace('spotify:', '')}`;
                    spotifyDiv.innerHTML = `<div class="spotify-header"><i class="fab fa-spotify"></i><p>Listening to Spotify</p></div><div class="spotify-content"><img src="${albumArtUrl}" alt="Album Art" class="spotify-album-art"><div class="spotify-track-info"><p class="spotify-song">${activity.details}</p><p class="spotify-artist">by ${activity.state}</p></div></div>`;
                    activitiesContainerEl.appendChild(spotifyDiv);
                } else {
                    const activityDiv = document.createElement('div');
                    activityDiv.className = 'activity';
                    activityDiv.style.animationDelay = `${index * 120 + 500}ms`;
                    let imageHtml = '';
                    if (activity.assets && activity.assets.large_image) {
                        const imageUrl = activity.assets.large_image.startsWith('mp:external') ? `https://media.discordapp.net/${activity.assets.large_image.substring(3)}` : `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
                        imageHtml = `<img src="${imageUrl}" alt="${activity.name}" class="activity-image">`;
                    }
                    const detailsHtml = `<div class="activity-details"><p class="activity-name">${activity.name}</p>${activity.details ? `<p class="activity-details-text">${activity.details}</p>` : ''}${activity.state ? `<p class="activity-state">${activity.state}</p>` : ''}</div>`;
                    activityDiv.innerHTML = imageHtml + detailsHtml;
                    activitiesContainerEl.appendChild(activityDiv);
                }
            });
        }
        
        if (activitiesContainerEl.innerHTML === '') {
            activitiesContainerEl.innerHTML = `<p class="idle-message">Chilling and vibing. Probably watching the ceiling.</p>`;
        }
    };
});
