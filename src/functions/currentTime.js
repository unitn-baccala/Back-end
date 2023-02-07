/* istanbul ignore file */
const currentTime = () => {
    const date = new Date();
    return date.getHours() * 60 + date.getMinutes();
};

module.exports = currentTime;