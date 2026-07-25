using System;
using System.Data;
using System.Linq;
using MySqlConnector;
using Dapper;

class Program
{
    static void Main()
    {
        string connStr = "server=34.87.84.198;port=3306;user=pizzamaxuser;password=Abcd1234+;database=pizzamax;SslMode=Disabled";
        using var conn = new MySqlConnection(connStr);

        try
        {
            conn.Open();
            Console.WriteLine("Connection successful!");

            var item = conn.QueryFirstOrDefault("SELECT ID, Name, ItemImage, ItemImagePopup FROM menuitems WHERE ID = 16");
            if (item != null)
            {
                string img = item.ItemImage?.ToString() ?? "";
                string popup = item.ItemImagePopup?.ToString() ?? "";
                Console.WriteLine($"  ID: {item.ID}, Name: {item.Name}");
                Console.WriteLine($"  ItemImage length: {img.Length}");
                if (img.Length > 200)
                {
                    Console.WriteLine($"  ItemImage starts with: {img.Substring(0, 200)}");
                    Console.WriteLine($"  ItemImage ends with: {img.Substring(img.Length - 200)}");
                }
                else
                {
                    Console.WriteLine($"  ItemImage: {img}");
                }
            }
            var encryptedBytes = Convert.FromBase64String("U3KswGaC92k=");
            using var des = new System.Security.Cryptography.TripleDESCryptoServiceProvider
            {
                IV = new byte[8]
            };
            using var pdb = new System.Security.Cryptography.PasswordDeriveBytes("1$34)[+-@#", new byte[0]);
            des.Key = pdb.CryptDeriveKey("RC2", "MD5", 128, new byte[8]);
            using var ms = new System.IO.MemoryStream();
            using var decStream = new System.Security.Cryptography.CryptoStream(ms, des.CreateDecryptor(), System.Security.Cryptography.CryptoStreamMode.Write);
            decStream.Write(encryptedBytes, 0, encryptedBytes.Length);
            decStream.FlushFinalBlock();
            Console.WriteLine("Decrypted Admin Password: " + System.Text.Encoding.UTF8.GetString(ms.ToArray()));
        }
        catch (Exception ex)
        {
            Console.WriteLine("Database Error: " + ex.Message);
        }
    }
}
