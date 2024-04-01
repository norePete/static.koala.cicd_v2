module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
            'regal-blue': '#243c5a',
            transitionDuration: { '2000': '2000ms', },
            width: { '400': '1000px', },
            minWidth: { '720': '720px', },
            height: { '400': '1000px', },
            keyframes: {
                banner: {
                  '0%':  { opacity: '0' },
                  '15%': { opacity: '0' },
                  '50%': { opacity: '1' },
                  '85%': { opacity: '0' },
                  '100%': { transform: 'translateX(100vw)' },
                },
            },
        },
	},
	plugins: [],
};

