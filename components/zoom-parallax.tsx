'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef } from 'react';

interface Image {
	src: string;
	alt?: string;
}

interface ZoomParallaxProps {
	/** Array of images to be displayed in the parallax effect max 7 images */
	images: Image[];
}

export function ZoomParallax({ images }: ZoomParallaxProps) {
	const container = useRef(null);
	const mockupRef = useRef(null);
	
	const { scrollYProgress } = useScroll({
		target: container,
		offset: ['start center', 'end end'],
	});

	const { scrollYProgress: mockupProgress } = useScroll({
		target: mockupRef,
		offset: ['start end', 'end start'],
	});

	const scale4 = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 4]);
	const scale5 = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 5]);
	const scale6 = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 6]);
	const scale8 = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 8]);
	const scale9 = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 9]);

	// All images appear together at the start
	const opacity1 = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
	const opacity2 = useTransform(scrollYProgress, [0, 0.15], [0, 1]);
	const opacity3 = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
	const opacity4 = useTransform(scrollYProgress, [0, 0.25], [0, 1]);
	const opacity5 = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
	const opacity6 = useTransform(scrollYProgress, [0, 0.35], [0, 1]);
	const opacity7 = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

	const mockupY = useTransform(mockupProgress, [0, 1], [100, -100]);
	const mockupScale = useTransform(mockupProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

	const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];
	const opacities = [opacity1, opacity2, opacity3, opacity4, opacity5, opacity6, opacity7];

	return (
		<>
			<div ref={container} className="relative h-[200vh] bg-white">
				<div className="sticky top-0 h-screen overflow-hidden">
					<div className="absolute inset-0 flex items-center justify-center translate-y-[10vh]">
						{images.map(({ src, alt }, index) => {
							const scale = scales[index % scales.length];
							const opacity = opacities[index % opacities.length];

						// Text cards for index 2, 3, and 6
						if (index === 2) {
							return (
								<motion.div
									key={index}
									style={{ scale, opacity }}
									className="absolute inset-0 flex items-center justify-center [&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[45vh] [&>div]:!w-[20vw]"
								>
									<div className="relative h-[45vh] w-[20vw] bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 flex flex-col justify-center shadow-lg border border-white/20">
										<p className="text-xs md:text-sm font-semibold text-blue-900 mb-2">QS. At-Taubah: 103</p>
										<p className="text-sm md:text-base text-gray-800 mb-3 text-right leading-relaxed" style={{ fontFamily: 'serif' }}>
											خُذْ مِنْ أَمْوَٰلِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا
										</p>
										<p className="text-[10px] md:text-xs text-gray-600 leading-relaxed italic">
											&quot;Ambillah zakat dari sebagian harta mereka, dengan zakat itu kamu membersihkan dan mensucikan mereka...&quot;
										</p>
									</div>
								</motion.div>
							);
						}

						if (index === 3) {
							return (
								<motion.div
									key={index}
									style={{ scale, opacity }}
									className="absolute inset-0 flex items-center justify-center [&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]"
								>
									<div className="relative h-[25vh] w-[25vw] bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 flex flex-col justify-center shadow-lg border border-white/20">
										<p className="text-xs md:text-sm font-semibold text-blue-900 mb-2">QS. Al-Hadid: 7</p>
										<p className="text-sm md:text-base text-gray-800 mb-2 text-right leading-relaxed" style={{ fontFamily: 'serif' }}>
											وَأَنفِقُوا مِمَّا جَعَلَكُم مُّسْتَخْلَفِينَ فِيهِ
										</p>
										<p className="text-[10px] md:text-xs text-gray-600 leading-relaxed italic">
											&quot;...dan nafkahkanlah sebagian dari hartamu...&quot;
										</p>
									</div>
								</motion.div>
							);
						}

						// Center bottom text card with white background, blue and yellow text
						if (index === 6) {
							return (
								<motion.div
									key={index}
									style={{ scale, opacity }}
									className="absolute inset-0 flex items-center justify-center [&>div]:!top-[22.5vh] [&>div]:!left-[25vw] [&>div]:!h-[15vh] [&>div]:!w-[15vw]"
								>
									<div className="relative h-[15vh] w-[15vw] bg-white rounded-3xl p-2 md:p-3 flex items-center justify-center shadow-xl overflow-hidden border border-slate-100">
										<h3 className="relative text-[8px] sm:text-[10px] md:text-xs lg:text-sm xl:text-base font-bold text-center leading-tight px-1">
											<span className="text-yellow-500">Jadikan</span>{' '}
											<span className="text-blue-600">Dana</span>
											<br />
											<span className="text-blue-600">Masjid</span>{' '}
											<span className="text-yellow-500">sebagai</span>
											<br />
											<span className="text-yellow-500">panduan untuk</span>
											<br />
											<span className="text-yellow-500">memakmurkan</span>
											<br />
											<span className="text-blue-600">Masjid</span>
										</h3>
									</div>
								</motion.div>
							);
						}

						return (
							<motion.div
								key={index}
								style={{ scale, opacity }}
								className={`absolute inset-0 flex items-center justify-center ${
									index === 0 ? '' :
									index === 1 ? '[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]' : 
									index === 4 ? '[&>div]:!top-[27.5vh] [&>div]:!left-[5vw] [&>div]:!h-[25vh] [&>div]:!w-[20vw]' : 
									index === 5 ? '[&>div]:!top-[27.5vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]' : 
									''
								}`}
							>
								<div className="relative h-[25vh] w-[25vw]">
									<img
										src={src || '/placeholder.svg'}
										alt={alt || `Parallax image ${index + 1}`}
										className="h-full w-full object-cover rounded-2xl"
										style={{ backfaceVisibility: 'hidden', WebkitFontSmoothing: 'antialiased' }}
									/>
								</div>
							</motion.div>
						);
					})}
					</div>
				</div>
			</div>
			
			<div ref={mockupRef} className="relative py-20 px-0 overflow-visible -mt-100 md:-mt-140 lg:-mt-192">
				<div className="w-full mx-auto">
					<motion.div 
						style={{ y: mockupY, scale: mockupScale }}
						className="flex justify-center items-center"
					>
					</motion.div>
				</div>
			</div>

			<style jsx>{`
				img {
					-webkit-backface-visibility: hidden;
					-moz-backface-visibility: hidden;
					backface-visibility: hidden;
					-webkit-transform: translateZ(0) scale(1.0, 1.0);
					transform: translateZ(0);
					image-rendering: -webkit-optimize-contrast;
					image-rendering: crisp-edges;
				}
				
				div {
					-webkit-backface-visibility: hidden;
					-moz-backface-visibility: hidden;
					backface-visibility: hidden;
				}
			`}</style>
		</>
	);
}
