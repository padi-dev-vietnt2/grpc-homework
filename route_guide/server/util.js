const COORD_FACTOR = 1e7;

/**
 * Calculate the distance between two points using the "haversine" formula.
 * The formula is based on http://mathforum.org/library/drmath/view/51879.html.
 * @param start The starting point
 * @param end The end point
 * @return The distance between the points in meters
 */
 function getDistance(start, end) {
    function toRadians(num) {
      return num * Math.PI / 180;
    }
    const R = 6371000;  // earth radius in metres
    const lat1 = toRadians(start.latitude / COORD_FACTOR);
    const lat2 = toRadians(end.latitude / COORD_FACTOR);
    const lon1 = toRadians(start.longitude / COORD_FACTOR);
    const lon2 = toRadians(end.longitude / COORD_FACTOR);
  
    const deltalat = lat2-lat1;
    const deltalon = lon2-lon1;
    const a = Math.sin(deltalat/2) * Math.sin(deltalat/2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltalon/2) * Math.sin(deltalon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

module.exports = { getDistance }
