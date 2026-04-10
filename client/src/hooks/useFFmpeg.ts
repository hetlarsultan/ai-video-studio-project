import { useEffect, useRef, useState } from 'react';
import { FFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { toast } from 'sonner';

export interface FFmpegProgress {
  progress: number;
  status: string;
}

export function useFFmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<FFmpegProgress>({
    progress: 0,
    status: 'جاهز',
  });

  // تحميل FFmpeg عند الحاجة
  const loadFFmpeg = async () => {
    if (isLoaded || isLoading) return;

    setIsLoading(true);
    try {
      const ffmpeg = new FFmpeg();

      ffmpeg.on('progress', ({ progress: prog }) => {
        setProgress({
          progress: Math.round(prog * 100),
          status: `جاري المعالجة: ${Math.round(prog * 100)}%`,
        });
      });

      ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]', message);
      });

      // تحميل FFmpeg من CDN
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await ffmpeg.load({
        coreURL: `${baseURL}/ffmpeg-core.js`,
        wasmURL: `${baseURL}/ffmpeg-core.wasm`,
      });

      ffmpegRef.current = ffmpeg;
      setIsLoaded(true);
      toast.success('تم تحميل FFmpeg بنجاح');
    } catch (error) {
      console.error('خطأ في تحميل FFmpeg:', error);
      toast.error('فشل تحميل FFmpeg');
    } finally {
      setIsLoading(false);
    }
  };

  // معالجة الفيديو
  const processVideo = async (
    inputFile: File,
    outputFormat: string = 'mp4',
    options?: Record<string, any>
  ): Promise<Blob | null> => {
    if (!ffmpegRef.current?.isLoaded()) {
      toast.error('FFmpeg غير محمل');
      return null;
    }

    try {
      const ffmpeg = ffmpegRef.current;
      const inputName = 'input.' + inputFile.name.split('.').pop();
      const outputName = `output.${outputFormat}`;

      setProgress({ progress: 0, status: 'جاري تحميل الملف...' });

      // كتابة الملف المدخل
      await ffmpeg.writeFile(inputName, await fetchFile(inputFile));

      setProgress({ progress: 20, status: 'جاري معالجة الفيديو...' });

      // بناء أوامر FFmpeg
      const args = [
        '-i',
        inputName,
        ...(options?.scale ? ['-vf', `scale=${options.scale}`] : []),
        ...(options?.fps ? ['-r', options.fps.toString()] : []),
        ...(options?.bitrate ? ['-b:v', options.bitrate] : []),
        '-c:a',
        'aac',
        outputName,
      ];

      // تنفيذ FFmpeg
      await ffmpeg.exec(args);

      setProgress({ progress: 80, status: 'جاري حفظ الملف...' });

      // قراءة الملف المخرج
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data], { type: `video/${outputFormat}` });

      // تنظيف الملفات
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      setProgress({ progress: 100, status: 'تم بنجاح!' });
      toast.success('تمت معالجة الفيديو بنجاح');

      return blob;
    } catch (error) {
      console.error('خطأ في معالجة الفيديو:', error);
      toast.error('فشل معالجة الفيديو');
      return null;
    }
  };

  // دمج الفيديوهات
  const mergeVideos = async (files: File[]): Promise<Blob | null> => {
    if (!ffmpegRef.current?.isLoaded()) {
      toast.error('FFmpeg غير محمل');
      return null;
    }

    try {
      const ffmpeg = ffmpegRef.current;

      setProgress({ progress: 0, status: 'جاري تحميل الملفات...' });

      // كتابة جميع الملفات
      const fileList: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const inputName = `input${i}.${files[i].name.split('.').pop()}`;
        await ffmpeg.writeFile(inputName, await fetchFile(files[i]));
        fileList.push(inputName);
      }

      setProgress({ progress: 40, status: 'جاري دمج الفيديوهات...' });

      // إنشاء ملف concat
      const concatContent = fileList.map(f => `file '${f}'`).join('\n');
      await ffmpeg.writeFile('concat.txt', concatContent);

      // دمج الفيديوهات
      const outputName = 'output.mp4';
      await ffmpeg.exec([
        '-f',
        'concat',
        '-safe',
        '0',
        '-i',
        'concat.txt',
        '-c',
        'copy',
        outputName,
      ]);

      setProgress({ progress: 80, status: 'جاري حفظ الملف...' });

      // قراءة الملف المخرج
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data], { type: 'video/mp4' });

      // تنظيف الملفات
      for (const file of fileList) {
        await ffmpeg.deleteFile(file);
      }
      await ffmpeg.deleteFile('concat.txt');
      await ffmpeg.deleteFile(outputName);

      setProgress({ progress: 100, status: 'تم دمج الفيديوهات بنجاح!' });
      toast.success('تم دمج الفيديوهات بنجاح');

      return blob;
    } catch (error) {
      console.error('خطأ في دمج الفيديوهات:', error);
      toast.error('فشل دمج الفيديوهات');
      return null;
    }
  };

  // استخراج الصوت
  const extractAudio = async (videoFile: File): Promise<Blob | null> => {
    if (!ffmpegRef.current?.isLoaded()) {
      toast.error('FFmpeg غير محمل');
      return null;
    }

    try {
      const ffmpeg = ffmpegRef.current;
      const inputName = 'input.' + videoFile.name.split('.').pop();
      const outputName = 'output.mp3';

      setProgress({ progress: 0, status: 'جاري تحميل الفيديو...' });
      await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

      setProgress({ progress: 50, status: 'جاري استخراج الصوت...' });
      await ffmpeg.exec(['-i', inputName, '-q:a', '9', '-n', outputName]);

      setProgress({ progress: 80, status: 'جاري حفظ الملف...' });
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data], { type: 'audio/mpeg' });

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      setProgress({ progress: 100, status: 'تم استخراج الصوت بنجاح!' });
      toast.success('تم استخراج الصوت بنجاح');

      return blob;
    } catch (error) {
      console.error('خطأ في استخراج الصوت:', error);
      toast.error('فشل استخراج الصوت');
      return null;
    }
  };

  return {
    isLoaded,
    isLoading,
    progress,
    loadFFmpeg,
    processVideo,
    mergeVideos,
    extractAudio,
  };
}
