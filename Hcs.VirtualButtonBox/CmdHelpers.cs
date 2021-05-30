using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Diagnostics;
using System.Text;

namespace Hcs.VirtualButtonBox
{
    public static class CmdHelpers
    {
        public static async Task<IReadOnlyList<string>> ExcuteAsync(string path, Action<ProcessStartInfo> starInfoConfig = null)
        {
            using var process = new Process();
            var startInfo = new ProcessStartInfo
            {
                CreateNoWindow = true,
                WindowStyle = ProcessWindowStyle.Hidden,
                UseShellExecute = false,
                RedirectStandardError = true,
                RedirectStandardOutput = true,
                FileName = path
            };
            var output = new List<string>();
            process.OutputDataReceived += (sender, args) => output.Add(args.Data);

            starInfoConfig?.Invoke(startInfo);
            process.StartInfo = startInfo;
            string stdError = null;
            await Task.Yield();
            try
            {
                process.Start();
                process.BeginOutputReadLine();
                stdError = await process.StandardError.ReadToEndAsync();
                await process.WaitForExitAsync();
            }
            catch (Exception e)
            {
                throw new Exception("OS error while executing " + Format(path, startInfo.Arguments) + ": " + e.Message, e);

            }
            if (process.ExitCode == 0)
            {
                return output;
            }
            else
            {
                var message = new StringBuilder();

                if (!string.IsNullOrEmpty(stdError))
                {
                    message.AppendLine(stdError);
                }

                if (output.Count != 0)
                {
                    message.AppendLine("Std output:");
                    message.AppendLine(string.Join("\n", output));
                }

                throw new Exception(Format(path, startInfo.Arguments) + " finished with exit code = " + process.ExitCode + ": " + message);
            }

        }
        private static string Format(string filename, string arguments)
        {
            return "'" + filename +
                ((string.IsNullOrEmpty(arguments)) ? string.Empty : " " + arguments) +
                "'";
        }
    }
}
