$(document).ready(function() {
    let currentPage = 1;
    const songsPerPage = 10; 

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
            let html = '';
            let filteredSongs = [];

            if (searchQuery) {
                filteredSongs = songs.filter(song => {
                    return (!filterGenre || song.Genre[0] === filterGenre) && 
                        (song.Id[0].includes(searchQuery) || 
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
                filteredSongs = songs.slice(start, end).filter(song => {
                    return !filterGenre || song.Genre[0] === filterGenre;
                });

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
                updatePagination(songs.length, page);
            }
            $('#song-list tbody').html(html);
        },
        error: function(error) {
            console.error('Error fetching songs', error);
        }
        });
        }

    // Function to update pagination controls
    function updatePagination(totalSongs, currentPage) {
        const totalPages = Math.ceil(totalSongs / songsPerPage);
        let pageNumbersHtml = '';

        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                pageNumbersHtml += `<span class="current-page">${i}</span>`;
            } else {
                pageNumbersHtml += `<span class="page-number">${i}</span>`;
            }
        }

        $('#page-numbers').html(pageNumbersHtml);

        $('#prev-page').prop('disabled', currentPage === 1);
        $('#next-page').prop('disabled', currentPage === totalPages);
    }

    // Handle pagination button clicks
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
        currentPage++;
        fetchSongs("", "", currentPage);
    });

    // Handle form submission to add a new song
    $('#add-song-form').on('submit', function(event) {
        event.preventDefault();
        const newSong = {
            Id: $('#add-song-id').val(),
            Title: $('#title').val(),
            Artist: $('#artist').val(),
            Genre: $('#genre').val(),
            PlayCount: $('#playcount').val()
        };

        // Check if the song already exists
        const existingSongs = $('#song-list tbody tr').map(function() {
            return {
                Id: $(this).find('td:eq(0)').text(),
                Title: $(this).find('td:eq(1)').text(),
                Artist: $(this).find('td:eq(2)').text(),
                Genre: $(this).find('td:eq(3)').text()
            };
        }).get();

        const isDuplicate = existingSongs.some(song => {
            return song.Id === newSong.Id || song.Title === newSong.Title;
        });

        if (!isDuplicate && parseInt(newSong.PlayCount) > 0) {
            $.ajax({
                url: '/add-song',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(newSong),
                success: function() {
                    fetchSongs();
                    alert('该歌曲已添加！');
                },
                error: function(error) {
                    console.error('Error adding song', error);
                }
            });
        }
        else if((newSong.PlayCount) < 0){
            alert('播放量不能小于0！');
        }
        else {
            alert('该歌曲或ID已存在！');
        }
    });

    // Handle form submission to edit a song
    $('#edit-songs-form').on('submit', function(event) {
        event.preventDefault();
        const editedSong = {
            Id: $('#edit-song-id').val(),
            Title: $('#edit-song-title').val(),
            Artist: $('#edit-song-artist').val(),
            Genre: $('#edit-song-genre').val(),
            PlayCount: $('#edit-song-playcount').val()
        };

        console.log('Editing song:', editedSong);
        const existingSongs = $('#song-list tbody tr').map(function() {
            return {
                Id: $(this).find('td:eq(0)').text(),
                Title: $(this).find('td:eq(1)').text(),
                Artist: $(this).find('td:eq(2)').text(),
                Genre: $(this).find('td:eq(3)').text()
            };
        }).get();
        const isDuplicate = existingSongs.some(song => {
            return song.Id === editedSong.Id;
        });
        if (isDuplicate && parseInt(editedSong.PlayCount) > 0) {
            $.ajax({
                url: '/edit-song',
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(editedSong),
                success: function() {
                    fetchSongs();
                    alert('该歌曲已修改！');
                },
                error: function(error) {
                    console.error('Error editing song', error);
                }
            });
        }
        else if((editedSong.PlayCount) < 0){
            alert('播放量不能小于0！');
        }
        else {
            alert('该歌曲ID不存在！');
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
                alert('删除歌曲时出现错误。请稍后重试。');
            }
        });
    });

    // Fetch songs initially
    fetchSongs();
});