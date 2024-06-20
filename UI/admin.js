$(document).ready(function() {
    let currentPage = 1;
    let songsPerPage = 10;
    const songsPerPageSelect = document.getElementById('songs-per-page');
    let totalSongs = 0; // Initialize totalSongs
    
    songsPerPageSelect.addEventListener('change', function() {
        const value = parseInt(songsPerPageSelect.value, 10);
        if (!isNaN(value) && value > 0) {
            songsPerPage = value;
            currentPage = 1; // Reset to first page when songsPerPage changes
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

    $('.sidebar-trigger').mouseenter(function() {
        $('.sidebar').stop(true, true).fadeIn();
    });



    $('.sidebar').mouseleave(function() {
        $('.sidebar').stop(true, true).fadeOut();
    });

    // Hide sections initially
    $('#add-song-section').hide();
    $('#delete-songs-section').hide();
    $('#edit-songs-section').hide();
    $('#view-songs-section').hide();
    $('#hr').hide();

    // Show add song section
    $('#addSongBtn').on('click', function() {
        $('#add-song-section').show();
        $('#view-songs-section').hide();
        $('#edit-songs-section').hide();
        $('#delete-songs-section').hide();
        $('#hr').show();
    });

    // Show view songs section
    $('#viewSongsBtn').on('click', function() {
        $('#add-song-section').hide();
        $('#view-songs-section').show();
        $('#edit-songs-section').hide();
        $('#delete-songs-section').hide();
        $('#hr').show();
        fetchSongs();
    });

    // Show edit songs section
    $('#editSongBtn').on('click', function() {
        $('#add-song-section').hide();
        $('#view-songs-section').hide();
        $('#edit-songs-section').show();
        $('#delete-songs-section').hide();
        $('#hr').show();
    });

    // Show delete songs section
    $('#deleteSongBtn').on('click', function() {
        $('#add-song-section').hide();
        $('#view-songs-section').hide();
        $('#edit-songs-section').hide();
        $('#delete-songs-section').show();
        $('#hr').show(); 
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
                totalSongs = songs.length; 
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


// Function to fetch existing songs
function fetchExistingSongs() {
    return $('#song-list tbody tr').map(function() {
        return {
            Id: $(this).find('td:eq(0)').text().trim(),
            Title: $(this).find('td:eq(1)').text().trim(),
            Artist: $(this).find('td:eq(2)').text().trim(),
            Genre: $(this).find('td:eq(3)').text().trim()
        };
    }).get();
}

$('#add-song-form').on('submit', function(event) {
    event.preventDefault();
    const newSong = {
        Id: $('#add-song-id').val().trim(),
        Title: $('#title').val().trim(),
        Artist: $('#artist').val().trim(),
        Genre: $('#genre').val().trim(),
        PlayCount: $('#playcount').val().trim()
    };

    console.log('New Song:', newSong);

    const existingSongs = fetchExistingSongs();
    console.log('Existing Songs:', existingSongs);

    const isDuplicate = existingSongs.some(song => song.Id === newSong.Id || song.Title === newSong.Title);
    const searchQuery = $('#search-query').val();
    if (!isDuplicate && parseInt(newSong.PlayCount) > 0) {
        $.ajax({
            url: '/add-song',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(newSong),
            success: function() {
                fetchSongs("", searchQuery);
                alert('该歌曲已添加！');
                $('#add-song-form').trigger("reset");
            },
            error: function(error) {
                console.error('Error adding song', error);
                alert('添加歌曲时出错，请稍后重试。');
            }
        });
    } else if (parseInt(newSong.PlayCount) < 0) {
        alert('播放量不能小于0！');
    } else if (isDuplicate) {
        fetchSongs(); 
        alert('该歌曲或ID已存在！');
    }
});

$('#edit-songs-form').on('submit', function(event) {
    event.preventDefault();
    const editedSong = {
        Id: $('#edit-song-id').val().trim(),
        Title: $('#edit-song-title').val().trim(),
        Artist: $('#edit-song-artist').val().trim(),
        Genre: $('#edit-song-genre').val().trim(),
        PlayCount: $('#edit-song-playcount').val().trim()
    };

    console.log('Edited Song:', editedSong);

    const existingSongs = fetchExistingSongs();
    console.log('Existing Songs:', existingSongs);

    const isDuplicate = existingSongs.some(song => song.Title === editedSong.Title && song.Id !== editedSong.Id);
    const searchQuery = $('#search-query').val();
    if (!isDuplicate && parseInt(editedSong.PlayCount) > 0) {
        $.ajax({
            url: '/edit-song',
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(editedSong),
            success: function() {
                fetchSongs("", searchQuery);
                alert('该歌曲已修改！');
                $('#edit-songs-form').trigger("reset");
            },
            error: function(error) {
                console.error('Error editing song', error);
                alert('修改歌曲时出错，请稍后重试。');
            }
        });
    } else if (parseInt(editedSong.PlayCount) < 0) {
        alert('播放量不能小于0！');
    } else if (isDuplicate) {
        fetchSongs(); 
        alert('该歌曲名已存在！');
    } 
});
    // Handle genre filter change
    $('#genre-filter').on('change', function() {
        const selectedGenre = $(this).val();
        fetchSongs(selectedGenre, "", currentPage);
    });

    // Handle view all songs button
    $('#view-all-songs').on('click', function() {
        fetchSongs();
    });

   // Handle reset songs button
$('#reset-songs').on('click', function() {
    if (confirm('您确定要重置歌曲数据吗？')) {
        $.ajax({
            url: '/reset-songs',
            method: 'POST',
            success: function() {
                fetchSongs();
                alert('歌曲数据已恢复');
            },
            error: function(error) {
                console.error('Error resetting songs', error);
            }
        });
    } else {
        alert('操作已取消。');
    }
});

    // Handle search songs button
    $('#search-songs').on('click', function() {
        const searchQuery = $('#search-query').val();
           fetchSongs("", searchQuery);     
    });

    // Handle delete song
    $('#delete-songs-form').on('submit', function(event) {
        event.preventDefault();
        const songId = $('#delete-song-id').val();

        console.log('Deleting song with ID:', songId);

        $.ajax({
            url: `/delete-song/${songId}`,
            method: 'DELETE',
            success: function() {
                fetchSongs();
                alert('歌曲已删除。');
            },
            error: function(error) {
                console.error('Error deleting song', error);
                alert('删除歌曲id不存在。');
            }
        });
    });
 // Fetch songs initially
 fetchSongs("", "", currentPage);
});