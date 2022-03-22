module.exports.inRange = (x, min, max) => {
    return ((x - min) * (x - max) <= 0);
}