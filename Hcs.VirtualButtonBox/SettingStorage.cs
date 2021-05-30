using Microsoft.AspNetCore.Hosting;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Hcs.VirtualButtonBox
{
    public class SettingStorage : ISettingStorage
    {
        private readonly DirectoryInfo dir;

        public SettingStorage(string directory)
        {
            dir = new DirectoryInfo(directory);
            if (!dir.Exists)
            {
                dir.Create();
            }
        }
        readonly ConcurrentDictionary<string, object> settingCache = new ConcurrentDictionary<string, object>();
        readonly ConcurrentDictionary<string, SemaphoreSlim> fileLockers = new ConcurrentDictionary<string, SemaphoreSlim>();
        readonly SemaphoreSlim lockerLocker = new SemaphoreSlim(1, 1);
        async Task<SemaphoreSlim> GetLockerByKey(string key)
        {
            if (fileLockers.TryGetValue(key, out SemaphoreSlim locker))
            {
                return locker;
            }
            await lockerLocker.WaitAsync();
            try
            {
                if (fileLockers.TryGetValue(key, out locker))
                {
                    return locker;
                }
                else
                {
                    var newLock = new SemaphoreSlim(1, 1);
                    if (fileLockers.TryAdd(key, newLock))
                    {
                        return newLock;
                    }
                    return null;
                }
            }
            finally
            {
                lockerLocker.Release();
            }
        }
        void CheckPath(string key)
        {
            if (string.IsNullOrWhiteSpace(key))
            {
                throw new Exception("key empty");
            }
            var file = new FileInfo(Path.Combine(dir.FullName, key));
            if (!file.FullName.StartsWith(dir.FullName))
            {
                throw new Exception("key not valid");
            }
        }
        public async Task UpdateAsync<T>(string key, Action<T> updator) where T : new()
        {
            CheckPath(key);
            var locker = await GetLockerByKey(key);
            await locker.WaitAsync();
            try
            {
                var value = await GetInternalAsync<T>(key);
                updator(value);
                var file = new FileInfo(Path.Combine(dir.FullName, key));
                if (file.Exists)
                {
                    file.Delete();
                }
                file.Refresh();
                using var fs = file.Open(FileMode.Create, FileAccess.Write, FileShare.Read);
                using var sw = new StreamWriter(fs, Encoding.UTF8);
                await sw.WriteAsync(JsonConvert.SerializeObject(value));
            }
            finally
            {
                locker.Release();
            }
        }
        async Task<T> GetInternalAsync<T>(string key) where T : new()
        {
            if (settingCache.TryGetValue(key, out object value))
            {
                if (typeof(T).IsAssignableFrom(value.GetType()))
                {
                    return (T)value;
                }
                else
                {
                    throw new Exception($"type {value.GetType()} can't cast to {typeof(T)}");
                }
            }
            var file = new FileInfo(Path.Combine(dir.FullName, key));
            if (file.Exists)
            {
                using var fs = file.Open(FileMode.Open, FileAccess.Read, FileShare.Read);
                using var sr = new StreamReader(fs, Encoding.UTF8, true);
                var json = await sr.ReadToEndAsync();
                var obj = JsonConvert.DeserializeObject<T>(json);
                settingCache.TryAdd(key, obj);
                return obj;
            }
            else
            {
                var no = new T();
                settingCache.TryAdd(key, no);
                return no;
            }
        }
        public async Task<T> GetAsync<T>(string key) where T : new()
        {
            CheckPath(key);
            if (settingCache.TryGetValue(key, out object value))
            {
                if (typeof(T).IsAssignableFrom(value.GetType()))
                {
                    return (T)value;
                }
                else
                {
                    throw new Exception($"type {value.GetType()} can't cast to {typeof(T)}");
                }
            }
            var locker = await GetLockerByKey(key);
            await locker.WaitAsync();
            try
            {
                return await GetInternalAsync<T>(key);
            }
            finally
            {
                locker.Release();
            }

        }
    }
}
