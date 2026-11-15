"use strict";

/*
 * Offline backup list for the Character database.
 * It is used only when the Jikan API cannot be reached and nothing is saved from an earlier visit.
 * It is a plain script (not a JSON file) so it also works when index.html is opened from disk.
 * Names and roles only: popularity numbers, images and voice actors come from the API.
 */
window.SCA_FALLBACK = [
  ["Eren Yeager", "Main"], ["Mikasa Ackerman", "Main"], ["Armin Arlert", "Main"], ["Levi Ackerman", "Main"],
  ["Erwin Smith", "Supporting"], ["Hange Zoe", "Supporting"], ["Jean Kirstein", "Supporting"],
  ["Connie Springer", "Supporting"], ["Sasha Blouse", "Supporting"], ["Reiner Braun", "Supporting"],
  ["Bertholdt Hoover", "Supporting"], ["Annie Leonhart", "Supporting"], ["Historia Reiss", "Supporting"],
  ["Ymir", "Supporting"], ["Marco Bott", "Supporting"], ["Zeke Yeager", "Supporting"],
  ["Grisha Yeager", "Supporting"], ["Carla Yeager", "Supporting"], ["Hannes", "Supporting"],
  ["Keith Shadis", "Supporting"], ["Dot Pixis", "Supporting"], ["Kenny Ackerman", "Supporting"],
  ["Petra Ral", "Supporting"], ["Moblit Berner", "Supporting"], ["Mike Zacharias", "Supporting"],
  ["Nile Dok", "Supporting"], ["Floch Forster", "Supporting"], ["Pieck Finger", "Supporting"],
  ["Porco Galliard", "Supporting"], ["Falco Grice", "Supporting"], ["Gabi Braun", "Supporting"]
].map(function (item, index) {
  return { key: item[0].toLowerCase(), name: item[0], role: item[1], favorites: 0, image: "", url: "", voices: [] };
});
