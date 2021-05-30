using System;
using System.Threading.Tasks;

namespace Hcs.VirtualButtonBox
{
    public interface ISettingStorage
    {
        Task<T> GetAsync<T>(string key) where T : new();
        Task UpdateAsync<T>(string key, Action<T> updator) where T : new();
    }
}