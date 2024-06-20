$(document).ready(function() {
    const songsPerPage = 10;
    let currentPage = 1;
    let currentSongs = [];

    // Hide sections initially
    $('#view-songs-section').hide();
    
    // Show view songs section
    $('#viewSongsBtn').on('click', function() {
        $('#view-songs-section').show();
        fetchSongs();
    });

    // Function to fetch and display songs
    function fetchSongs(filterGenre = "", searchQuery = "") {
        $.ajax({
            url: '/songs',
            method: 'GET',
            dataType: 'json',
            data: {
                genre: filterGenre,
                query: searchQuery
            },
            success: function(data) {
                currentSongs = data.SongCollection.Song.filter(song => {
                    return (!filterGenre || song.Genre[0] === filterGenre) && 
                           (!searchQuery || song.Id[0].includes(searchQuery) || 
                            song.Title[0].includes(searchQuery) || 
                            song.Artist[0].includes(searchQuery) || 
                            song.Genre[0].includes(searchQuery));
                });
                if (currentSongs.length === 0) {
                    alert('未找到匹配的歌曲。');
                }
                displaySongs(currentPage);
            },
            error: function(error) {
                console.error('Error fetching songs', error);
            }
        });
    }

    function displaySongs(page) {
        const start = (page - 1) * songsPerPage;
        const end = start + songsPerPage;
        const pageSongs = currentSongs.slice(start, end);

        let html = '';
        pageSongs.forEach(song => {
            html += `<tr>
                <td>${song.Id[0]}</td>
                <td>${song.Title[0]}</td>
                <td>${song.Artist[0]}</td>
                <td>${song.Genre[0]}</td>
                <td>${song.PlayCount[0]}</td>
            </tr>`;
        });
        $('#song-list tbody').html(html);
        updatePagination();
    }

    function updatePagination() {
        const totalPages = Math.ceil(currentSongs.length / songsPerPage);
        const pageNumbers = $('#page-numbers');
        pageNumbers.empty();

        for (let i = 1; i <= totalPages; i++) {
            const span = $('<span>').text(i).addClass('page-number');
            if (i === currentPage) {
                span.addClass('active');
            }
            span.on('click', () => goToPage(i));
            pageNumbers.append(span);
        }

        $('#prev-page').prop('disabled', currentPage === 1);
        $('#next-page').prop('disabled', currentPage === totalPages);
    }

    function goToPage(page) {
        currentPage = page;
        displaySongs(page);
    }

    $('#prev-page').on('click', function() {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    });

    $('#next-page').on('click', function() {
        const totalPages = Math.ceil(currentSongs.length / songsPerPage);
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    });

    // Handle genre filter change
    $('#genre-filter').on('change', function() {
        const selectedGenre = $(this).val();
        fetchSongs(selectedGenre);
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
});