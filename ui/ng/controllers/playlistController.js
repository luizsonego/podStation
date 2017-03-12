(function() {
	angular.module('podstationApp').controller('playlistController', ['$scope', 'messageService', 'episodePlayer', PlaylistController]);

	function PlaylistController($scope, messageService, episodePlayer) {
		var playlist = this;

		playlist.play = play;
		playlist.remove = remove;
		
		initialize();

		updateList();

		messageService.for('playlist').onMessage('changed', function() {
			updateList();
		});

		function initialize() {
			playlist.entries = [];
			playlist.visible = true;
		}

		function updateList() {
			messageService.for('playlist').sendMessage('get', {}, function(response) {
				chrome.runtime.getBackgroundPage(function(bgPage) {
					var playlistEntries = response.entries;

					var episodeContainers = bgPage.podcastManager.getAllEpisodes(function(podcast, episode) {
						return playlistEntries.find(function(entry) {
							return podcast.url === entry.podcastUrl && episode.guid === entry.episodeGuid;
						}) !== undefined;
					});

					$scope.$apply(function() {
						playlist.entries = episodeContainers.map(function(episodeContainer) {
							return {
								title: episodeContainer.episode.title,
								image: episodeContainer.podcast.image,
								episodeGuid: episodeContainer.episode.guid,
								podcastUrl: episodeContainer.podcast.url
							}; 
						});
					});
				});
			});
		}

		function play(playlistEntry) {
			episodePlayer.play({
				episodeGuid: playlistEntry.episodeGuid,
				podcastUrl: playlistEntry.podcastUrl
			});
		}

		function remove(playlistEntry) {
			messageService.for('playlist').sendMessage('remove', {
				episodeGuid: playlistEntry.episodeGuid,
				podcastUrl: playlistEntry.podcastUrl
			});
		}
	}
})();