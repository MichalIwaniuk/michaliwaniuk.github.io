const modelData = {
      simple: {
        accuracy: 61.27,
        time: 799.4,
        params: "1 mln",
        f1: 0.5504,
        precision: 0.5605,
        recall: 0.5467,
        size: "4,02 MB"
      },
      medium: {
        accuracy: 63.39,
        time: 837.7,
        params: "2.4 mln",
        f1: 0.5872,
        precision: 0.6204,
        recall: 0.5714,
        size: "9.11 MB"
      },
      complex: {
        accuracy: 81.115,
        time: 2198.9,
        params: "3.4 mln",
        f1: 0.7957,
        precision: 0.8083,
        recall: 0.7876,
        size: "8.76 MB"
      }
    };
    const confMatrixImg = document.getElementById('confMatrix');
    const select = document.getElementById('modelSelect');

    const accuracySpan = document.getElementById('accuracy');
    const timeSpan = document.getElementById('time');
    const paramsSpan = document.getElementById('params');
    const f1Span = document.getElementById('f1');
    const precisionSpan = document.getElementById('precision');
    const recallSpan = document.getElementById('recall');
    const sizeSpan = document.getElementById('size');

    function animateValue(span, start, end, suffix = "", duration = 500, decimals = 0) {
      const range = end - start;
      let startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percent = Math.min(progress / duration, 1);
        const value = start + range * percent;
        span.textContent = value.toFixed(decimals) + suffix;
        if (progress < duration) {
          requestAnimationFrame(step);
        }
      }
      requestAnimationFrame(step);
    }

    select.addEventListener('change', () => {
      const model = modelData[select.value];

      animateValue(accuracySpan, parseInt(accuracySpan.textContent), model.accuracy, "%");
      animateValue(timeSpan, parseInt(timeSpan.textContent), model.time, " s");
      animateValue(f1Span, parseFloat(f1Span.textContent), model.f1, "", 500, 2);
      animateValue(precisionSpan, parseFloat(precisionSpan.textContent), model.precision, "", 500, 2);
      animateValue(recallSpan, parseFloat(recallSpan.textContent), model.recall, "", 500, 2);

      paramsSpan.textContent = model.params;
      sizeSpan.textContent = model.size;

      confMatrixImg.style.opacity = 0;
      setTimeout(() => {
        confMatrixImg.src = `../images/cm_${select.value}.PNG`;
        confMatrixImg.onload = () => confMatrixImg.style.opacity = 1;
      }, 200);
    });