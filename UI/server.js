$(document).ready(function() {
    let currentPage = 1;
    let songsPerPage = 10;
    const songsPerPageSelect = document.getElementById('songs-per-page');
    let totalSongs = 0;
    
    songsPerPageSelect.addEventListener('change', function() {
        const value = parseInt(songsPerPageSelect.value, 10);
        if (!isNaN(value) && value > 0) {
            songsPerPage = value;
            currentPage = 1;
            fetchSongs("", "", currentPage);
        }
    });
    
    function updatePagination(totalSongs, currentPage) {
        const totalPages = Math.ceil(totalSongs / songsPerPage);
        let pageNumbersHtml = '';
    
        let startPage = Math.max(currentPage - 2, 1);
        let endPage = Math.min(currentPage + 2, totalPages);
    
        if (currentPage <= 3) {
            startPage = 1;
            endPage = Math.min(5, totalPages);
        } else if (currentPage + 2 >= totalPages) {
            startPage = Math.max(totalPages - 4, 1);
            endPage = totalPages;
        }
    
        if (startPage > 1) {
            pageNumbersHtml += `<span class="page-number">1</span>`;
            if (startPage > 2) {
                pageNumbersHtml += `<span>...</span>`;
            }
        }
    
        for (let i = startPage; i <= endPage; i++) {
            if (i === currentPage) {
                pageNumbersHtml += `<span class="current-page">${i}</span>`;
            } else {
                pageNumbersHtml += `<span class="page-number">${i}</span>`;
            }
        }
    
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbersHtml += `<span>...</span>`;
            }
            pageNumbersHtml += `<span class="page-number">${totalPages}</span>`;
        }
    
        $('#page-numbers').html(pageNumbersHtml);
    
        $('#prev-page').prop('disabled', currentPage === 1);
        $('#next-page').prop('disabled', currentPage === totalPages);
    }
    
    $('#pagination').on('click', '.page-number', function() {
        const page = parseInt($(this).text());
        currentPage = page;
        fetchSongs("", "", currentPage);
    });
    
    $('#prev-page').on('click', function() {
        if (currentPage > 1) {
            currentPage--;
            fetchSongs("", "", currentPage);
        } 
    });
    
    $('#next-page').on('click', function() {
        const totalPages = Math.ceil(totalSongs / songsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            fetchSongs("", "", currentPage);
        } 
    })


    // Hide sections initially
    $('#add-song-section').hide();
    $('#delete-songs-section').hide();
    $('#edit-songs-section').hide();
    $('#view-songs-section').hide();
    $('#hr').hide();


    // Show view songs section
    $('#viewSongsBtn').on('click', function() {
        $('#add-song-section').hide();
        $('#view-songs-section').show();
        $('#edit-songs-section').hide();
        $('#delete-songs-section').hide();
        $('#hr').show();
        fetchSongs();
    });


    function fetchSongs(filterGenre = "", searchQuery = "", page = 1) {
        $.ajax({
            url: '/songs',
            method: 'GET',
            dataType: 'json',
            data: {
                genre: filterGenre,
                query: searchQuery
            },
            success: function(data) {
                const songs = data.SongCollection.Song;
                totalSongs = songs.length; // Update totalSongs with the length of songs
                let html = '';
                let filteredSongs = [];
    
                if (searchQuery) {
                    filteredSongs = songs.filter(song => {
                        return (song.Id[0].includes(searchQuery) || 
                                song.Title[0].includes(searchQuery) || 
                                song.Artist[0].includes(searchQuery) || 
                                song.Genre[0].includes(searchQuery));
                    });
    
                    if (filteredSongs.length === 0) {
                        alert('歌曲不存在');
                    }
    
                    filteredSongs.forEach(song => {
                        html += `<tr>
                            <td>${song.Id[0]}</td>
                            <td>${song.Title[0]}</td>
                            <td>${song.Artist[0]}</td>
                            <td>${song.Genre[0]}</td>
                            <td>${song.PlayCount[0]}</td>
                        </tr>`;
                    });
                    $('#pagination').hide(); 
                } else {
                    const start = (page - 1) * songsPerPage;
                    const end = start + songsPerPage;
                    filteredSongs = songs.filter(song => !filterGenre || song.Genre[0] === filterGenre).slice(start, end);
    
                    filteredSongs.forEach(song => {
                        html += `<tr>
                            <td>${song.Id[0]}</td>
                            <td>${song.Title[0]}</td>
                            <td>${song.Artist[0]}</td>
                            <td>${song.Genre[0]}</td>
                            <td>${song.PlayCount[0]}</td>
                        </tr>`;
                    });
                    $('#pagination').show(); 
                    updatePagination(totalSongs, page);
                }
                $('#song-list tbody').html(html);
            },
            error: function(error) {
                console.error('Error fetching songs', error);
            }
        });
    }
    
    // Handle genre filter change
    $('#genre-filter').on('change', function() {
        const selectedGenre = $(this).val();
        fetchSongs(selectedGenre, "", currentPage);
    });

    // Handle view all songs button
    $('#view-all-songs').on('click', function() {
        fetchSongs();
    });


    // Handle search songs button
    $('#search-songs').on('click', function() {
        const searchQuery = $('#search-query').val();
           fetchSongs("", searchQuery);     
    });


    // Fetch songs initially
    fetchSongs("", "", currentPage);
    fetchSongs();
});